import { createHash, randomUUID } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import ResourceUsageLog, {
  type ResourceAction,
  type ResourceStatus,
} from '#models/resource-usage-log'
import type {
  ResourceDenialReason,
  ResourceGuardServiceContract,
  ResourceLease,
  ResourceLimitResult,
  ResourcePolicy,
  ResourceReservation,
  ResourceReservationRequest,
  ResourceScopeType,
  ResourceUsageQuery,
  ResourceUsageRequest,
  ResourceUsageSnapshot,
} from './contracts.js'
import ResourcePolicyRepository from './policy-repository.js'
import ResourceGuardRedisStore, {
  type PolicyState,
  type StoreMetric,
  type StoreMode,
} from './redis-store.js'

const DEFAULT_RESERVATION_TTL_SECONDS = 300
const DEFAULT_LEASE_TTL_SECONDS = 60

export default class ResourceGuardService implements ResourceGuardServiceContract {
  private policyRepository = new ResourcePolicyRepository()
  private store = new ResourceGuardRedisStore()
  private safetyRateLimits = new Map<string, { limit: number; windowSeconds: number }>()

  registerSafetyRateLimit(resource: string, limit: number, windowSeconds: number) {
    if (
      !Number.isFinite(limit) ||
      limit <= 0 ||
      !Number.isFinite(windowSeconds) ||
      windowSeconds <= 0
    ) {
      throw new Error('Safety rate limits and windows must be positive')
    }
    this.safetyRateLimits.set(resource, { limit, windowSeconds })
  }

  async check(request: ResourceUsageRequest) {
    return this.evaluate(request, 'check')
  }

  async consume(request: ResourceUsageRequest) {
    return this.evaluate(request, 'consume')
  }

  async reserve(request: ResourceReservationRequest): Promise<ResourceReservation> {
    validateRequest(request)
    const reservationId = request.operationId
      ? deterministicUuid(`reservation:${request.resource}:${request.operationId}`)
      : randomUUID()
    const existing = request.operationId
      ? await db.from('resource_reservations').where('id', reservationId).first()
      : undefined
    if (existing?.status === 'RESERVED') {
      return {
        id: existing.id,
        resource: existing.resource,
        reservedAmount: Number(existing.reserved_amount),
        expiresAt: new Date(existing.expires_at),
      }
    }
    if (existing)
      throw new ResourceGuardError(`Resource reservation is ${existing.status.toLowerCase()}`, 409)
    const policies = await this.resolvePolicies(request)
    const precondition = policyPrecondition(policies, request)
    if (precondition) {
      await this.log('RESERVE', request, precondition)
      throw ResourceGuardError.fromResult(precondition)
    }

    const now = Date.now()
    const states = this.store.buildStates(request, policies, now)
    const requestedExpiry =
      now + normalizeTtl(request.expiresInSeconds, DEFAULT_RESERVATION_TTL_SECONDS) * 1000
    const windowExpiry = Math.min(
      ...states
        .filter(
          (state) => state.policy.limitType !== 'RATE' && state.policy.limitType !== 'CONCURRENCY'
        )
        .map((state) => state.periodEnd ?? Number.POSITIVE_INFINITY)
    )
    const expiresAtMs = Math.min(requestedExpiry, windowExpiry)
    const storeResult = await this.store.apply({
      request,
      states,
      mode: 'reserve',
      entryId: reservationId,
      entryExpiresAt: expiresAtMs,
    })
    const result = toLimitResult(storeResult, states)
    await this.log('RESERVE', request, result, { reservationId })
    if (!result.allowed) throw ResourceGuardError.fromResult(result)

    try {
      const nowDate = new Date()
      await db
        .table('resource_reservations')
        .insert({
          id: reservationId,
          resource: request.resource,
          reserved_amount: request.amount,
          actual_amount: null,
          status: 'RESERVED',
          operation_id: request.operationId ?? null,
          request: JSON.stringify(request),
          policy_states: JSON.stringify(states),
          expires_at: new Date(expiresAtMs),
          created_at: nowDate,
          updated_at: nowDate,
        })
        .onConflict('id')
        .ignore()
    } catch (error) {
      await this.store.finalizeReservation(states, reservationId, 'release')
      throw error
    }

    return {
      id: reservationId,
      resource: request.resource,
      reservedAmount: request.amount,
      expiresAt: new Date(expiresAtMs),
    }
  }

  async settle(reservationId: string, actualAmount: number) {
    validateIdentifier(reservationId, 'reservation ID')
    validateAmount(actualAmount, true)
    const reservation = await db.from('resource_reservations').where('id', reservationId).first()
    if (!reservation) throw new ResourceGuardError('Resource reservation was not found', 404)
    if (reservation.status === 'SETTLED') return
    if (reservation.status !== 'RESERVED') {
      throw new ResourceGuardError(
        `Resource reservation is ${reservation.status.toLowerCase()}`,
        409
      )
    }

    const request = readJson<ResourceReservationRequest>(reservation.request)
    const states = hydrateStates(readJson<PolicyState[]>(reservation.policy_states))
    const storeResult = await this.store.finalizeReservation(
      states,
      reservationId,
      'settle',
      actualAmount
    )
    const result = toLimitResult(storeResult, states)
    await this.log('SETTLE', { ...request, amount: actualAmount }, result, { reservationId })
    if (!result.allowed) throw ResourceGuardError.fromResult(result)
    if (!storeResult.found && new Date(reservation.expires_at).getTime() <= Date.now()) {
      await db
        .from('resource_reservations')
        .where('id', reservationId)
        .where('status', 'RESERVED')
        .update({ status: 'EXPIRED', updated_at: new Date() })
      throw new ResourceGuardError('Resource reservation has expired', 409)
    }

    await db
      .from('resource_reservations')
      .where('id', reservationId)
      .update({ status: 'SETTLED', actual_amount: actualAmount, updated_at: new Date() })
  }

  async release(reservationId: string) {
    validateIdentifier(reservationId, 'reservation ID')
    const reservation = await db.from('resource_reservations').where('id', reservationId).first()
    if (!reservation) throw new ResourceGuardError('Resource reservation was not found', 404)
    if (reservation.status === 'RELEASED' || reservation.status === 'EXPIRED') return
    if (reservation.status !== 'RESERVED') {
      throw new ResourceGuardError(
        `Resource reservation is ${reservation.status.toLowerCase()}`,
        409
      )
    }

    const request = readJson<ResourceReservationRequest>(reservation.request)
    const states = hydrateStates(readJson<PolicyState[]>(reservation.policy_states))
    const storeResult = await this.store.finalizeReservation(states, reservationId, 'release')
    const result = toLimitResult(storeResult, states)
    await this.log('RELEASE', request, result, { reservationId })
    await db
      .from('resource_reservations')
      .where('id', reservationId)
      .update({ status: 'RELEASED', updated_at: new Date() })
  }

  async acquire(request: ResourceUsageRequest): Promise<ResourceLease> {
    validateRequest(request)
    if (request.amount !== 1)
      throw new ResourceGuardError('Concurrency leases must acquire one slot', 400)
    const leaseId = request.operationId
      ? deterministicUuid(`lease:${request.resource}:${request.operationId}`)
      : randomUUID()
    const existing = request.operationId
      ? await db.from('resource_leases').where('id', leaseId).first()
      : undefined
    if (existing?.status === 'ACTIVE') {
      return {
        id: existing.id,
        resource: existing.resource,
        acquiredAt: new Date(existing.acquired_at),
        expiresAt: new Date(existing.expires_at),
      }
    }
    if (existing)
      throw new ResourceGuardError(`Resource lease is ${existing.status.toLowerCase()}`, 409)
    const policies = await this.resolvePolicies(request)
    const precondition = policyPrecondition(policies, request)
    if (precondition) {
      await this.log('ACQUIRE', request, precondition)
      throw ResourceGuardError.fromResult(precondition)
    }

    const now = Date.now()
    const states = this.store.buildStates(request, policies, now)
    const leaseTtl = normalizeTtl(
      numberMetadata(request.metadata?.leaseTtlSeconds),
      DEFAULT_LEASE_TTL_SECONDS
    )
    const expiresAt = new Date(now + leaseTtl * 1000)
    const storeResult = await this.store.apply({
      request,
      states,
      mode: 'acquire',
      entryId: leaseId,
      entryExpiresAt: expiresAt.getTime(),
    })
    const result = toLimitResult(storeResult, states)
    await this.log('ACQUIRE', request, result, { leaseId })
    if (!result.allowed) throw ResourceGuardError.fromResult(result)

    try {
      const nowDate = new Date(now)
      await db
        .table('resource_leases')
        .insert({
          id: leaseId,
          resource: request.resource,
          status: 'ACTIVE',
          operation_id: request.operationId ?? null,
          request: JSON.stringify(request),
          policy_states: JSON.stringify(states),
          acquired_at: nowDate,
          expires_at: expiresAt,
          released_at: null,
          created_at: nowDate,
          updated_at: nowDate,
        })
        .onConflict('id')
        .ignore()
    } catch (error) {
      await this.store.releaseLease(states, leaseId)
      throw error
    }

    return { id: leaseId, resource: request.resource, acquiredAt: new Date(now), expiresAt }
  }

  async releaseLease(leaseId: string) {
    validateIdentifier(leaseId, 'lease ID')
    const lease = await db.from('resource_leases').where('id', leaseId).first()
    if (!lease) throw new ResourceGuardError('Resource lease was not found', 404)
    if (lease.status === 'RELEASED' || lease.status === 'EXPIRED') return

    const request = readJson<ResourceUsageRequest>(lease.request)
    const states = hydrateStates(readJson<PolicyState[]>(lease.policy_states))
    const storeResult = await this.store.releaseLease(states, leaseId)
    const result = toLimitResult(storeResult, states)
    await this.log('RELEASE_LEASE', request, result, { leaseId })
    const status = new Date(lease.expires_at).getTime() <= Date.now() ? 'EXPIRED' : 'RELEASED'
    await db
      .from('resource_leases')
      .where('id', leaseId)
      .update({ status, released_at: new Date(), updated_at: new Date() })
  }

  async getUsage(query: ResourceUsageQuery): Promise<ResourceUsageSnapshot> {
    const request: ResourceUsageRequest = { ...query, amount: 0 }
    const policies = await this.resolvePolicies(request)
    const states = this.store.buildStates(request, policies)
    const storeResult = await this.store.apply({ request, states, mode: 'check' })
    const bottleneck = bottleneckMetric(states, storeResult.metrics ?? [])
    return {
      resource: query.resource,
      consumed: bottleneck?.consumed ?? 0,
      reserved: bottleneck?.reserved ?? 0,
      limit: bottleneck?.state.policy.limit,
      remaining: bottleneck
        ? Math.max(0, bottleneck.state.policy.limit - bottleneck.consumed - bottleneck.reserved)
        : undefined,
      periodStart: bottleneck?.state.periodStart
        ? new Date(bottleneck.state.periodStart)
        : undefined,
      periodEnd: bottleneck?.state.periodEnd ? new Date(bottleneck.state.periodEnd) : undefined,
    }
  }

  async resolvePolicies(request: ResourceUsageRequest) {
    validateRequest(request, true)
    return this.policyRepository.resolve(request, this.safetyPolicies(request))
  }

  async logExternalOutcome(
    request: ResourceUsageRequest,
    status: ResourceStatus,
    details?: Record<string, unknown>
  ) {
    await this.log('EXECUTE', request, { allowed: status === 'success' }, details, status)
  }

  private async evaluate(
    request: ResourceUsageRequest,
    mode: Extract<StoreMode, 'check' | 'consume'>
  ) {
    validateRequest(request)
    const policies = await this.resolvePolicies(request)
    const precondition = policyPrecondition(policies, request)
    if (precondition) {
      await this.log(mode === 'check' ? 'CHECK' : 'CONSUME', request, precondition)
      return precondition
    }
    const states = this.store.buildStates(request, policies)
    const result = toLimitResult(await this.store.apply({ request, states, mode }), states)
    await this.log(mode === 'check' ? 'CHECK' : 'CONSUME', request, result)
    return result
  }

  private safetyPolicies(request: ResourceUsageRequest): ResourcePolicy[] {
    const resource = request.resource
    const configuredRate = this.safetyRateLimits.get(resource) ?? {
      limit: 10_000,
      windowSeconds: 60,
    }
    const callerScope = safetyCallerScope(request)
    const now = new Date()
    const common = {
      resource,
      dimensions: undefined,
      enforcement: 'HARD' as const,
      priority: Number.MAX_SAFE_INTEGER,
      enabled: true,
      metadata: { isSafetyLimit: true, internal: true },
      createdAt: now,
      updatedAt: now,
    }
    return [
      {
        ...common,
        id: `safety:rate:${resource}`,
        scopeType: callerScope.type,
        scopeId: callerScope.id,
        limitType: 'RATE',
        limit: configuredRate.limit,
        window: { size: configuredRate.windowSeconds, unit: 'SECOND' },
      },
      {
        ...common,
        id: `safety:daily:${resource}`,
        scopeType: callerScope.type,
        scopeId: callerScope.id,
        limitType: 'QUOTA',
        limit: 1_000_000_000_000,
        window: { size: 1, unit: 'DAY' },
      },
      {
        ...common,
        id: `safety:concurrency:${resource}`,
        scopeType: 'GLOBAL',
        scopeId: null,
        limitType: 'CONCURRENCY',
        limit: 1_000,
      },
    ]
  }

  private async log(
    action: ResourceAction,
    request: ResourceUsageRequest,
    result: ResourceLimitResult,
    extra?: Record<string, unknown>,
    explicitStatus?: ResourceStatus
  ) {
    await ResourceUsageLog.create({
      resourceType: request.resource,
      action,
      status: explicitStatus ?? (result.allowed ? 'success' : 'denied'),
      userId: request.context.userId ?? null,
      tenantId: request.context.agencyId ?? null,
      ipAddress: request.context.ipAddress ?? null,
      userAgent: null,
      durationMs: null,
      details: {
        amount: request.amount,
        dimensions: request.dimensions,
        planId: request.context.planId,
        listingId: request.context.listingId,
        operationId: request.operationId,
        metadata: sanitizeMetadata(request.metadata),
        result,
        ...extra,
      },
    })
  }
}

export class ResourceGuardError extends Error {
  code?: ResourceDenialReason
  policyId?: string

  constructor(
    message: string,
    public status: number,
    result?: ResourceLimitResult
  ) {
    super(message)
    this.code = result?.reason
    this.policyId = result?.policyId
  }

  static fromResult(result: ResourceLimitResult) {
    const messages: Partial<Record<ResourceDenialReason, string>> = {
      RATE_LIMIT_EXCEEDED: 'Resource rate limit exceeded',
      QUOTA_EXCEEDED: 'Resource quota exceeded',
      CONCURRENCY_EXCEEDED: 'Resource concurrency limit exceeded',
      CAPACITY_EXCEEDED: 'Resource capacity exceeded',
      BUDGET_EXCEEDED: 'Resource budget exceeded',
      RESOURCE_DISABLED: 'Resource is disabled',
      ENTITLEMENT_REQUIRED: 'Resource entitlement is required',
    }
    const status =
      result.reason === 'RESOURCE_DISABLED' || result.reason === 'ENTITLEMENT_REQUIRED' ? 403 : 429
    return new ResourceGuardError(
      messages[result.reason!] ?? 'Resource usage denied',
      status,
      result
    )
  }
}

function policyPrecondition(
  policies: ResourcePolicy[],
  request: ResourceUsageRequest
): ResourceLimitResult | undefined {
  const disabled = policies.find((policy) => policy.metadata?.resourceDisabled === true)
  if (disabled) {
    return {
      allowed: false,
      reason: 'RESOURCE_DISABLED',
      policyId: disabled.id,
      matchedPolicies: policies.map((policy) => policy.id),
    }
  }
  const missingEntitlement = policies.find((policy) => {
    if (policy.metadata?.entitlementRequired !== true) return false
    const requiredScope = policy.metadata.requiredScopeType as ResourceScopeType | undefined
    if (!requiredScope) return true
    const contextKeys: Partial<Record<ResourceScopeType, keyof ResourceUsageRequest['context']>> = {
      PLAN: 'planId',
      AGENCY: 'agencyId',
      USER: 'userId',
      LISTING: 'listingId',
      IP: 'ipAddress',
    }
    return requiredScope === 'GLOBAL' ? false : !request.context[contextKeys[requiredScope]!]
  })
  if (missingEntitlement) {
    return {
      allowed: false,
      reason: 'ENTITLEMENT_REQUIRED',
      policyId: missingEntitlement.id,
      matchedPolicies: policies.map((policy) => policy.id),
    }
  }
}

function toLimitResult(
  storeResult: { allowed: boolean; blocked: number; metrics?: StoreMetric[] },
  states: PolicyState[]
): ResourceLimitResult {
  const blockedState = storeResult.blocked > 0 ? states[storeResult.blocked - 1] : undefined
  const blockedMetric =
    storeResult.blocked > 0 ? storeResult.metrics?.[storeResult.blocked - 1] : undefined
  const bottleneck = bottleneckMetric(states, storeResult.metrics ?? [])
  const state = blockedState ?? bottleneck?.state
  const metric = blockedMetric ?? bottleneck?.metric
  const current = state?.policy.limitType === 'CONCURRENCY' ? metric?.concurrency : metric?.consumed
  return {
    allowed: storeResult.allowed,
    reason: blockedState ? denialReason(blockedState.policy.limitType) : undefined,
    policyId: blockedState?.policy.id,
    limit: state?.policy.limit,
    consumed: current,
    remaining: state && metric ? Math.max(0, state.policy.limit - metric.projected) : undefined,
    retryAfterSeconds:
      blockedState?.policy.limitType === 'RATE' && blockedState.periodEnd
        ? Math.max(1, Math.ceil((blockedState.periodEnd - Date.now()) / 1000))
        : undefined,
    resetAt: state?.periodEnd ? new Date(state.periodEnd) : undefined,
    matchedPolicies: states.map((item) => item.policy.id),
  }
}

function bottleneckMetric(states: PolicyState[], metrics: StoreMetric[]) {
  return states
    .map((state, index) => ({
      state,
      metric: metrics[index],
      consumed:
        state.policy.limitType === 'CONCURRENCY'
          ? (metrics[index]?.concurrency ?? 0)
          : (metrics[index]?.consumed ?? 0),
      reserved: metrics[index]?.reserved ?? 0,
    }))
    .filter((item) => item.metric)
    .sort(
      (left, right) =>
        (left.state.policy.limit - left.metric.projected) / Math.max(left.state.policy.limit, 1) -
        (right.state.policy.limit - right.metric.projected) / Math.max(right.state.policy.limit, 1)
    )[0]
}

function denialReason(limitType: ResourcePolicy['limitType']): ResourceDenialReason {
  const reasons: Record<ResourcePolicy['limitType'], ResourceDenialReason> = {
    RATE: 'RATE_LIMIT_EXCEEDED',
    QUOTA: 'QUOTA_EXCEEDED',
    CONCURRENCY: 'CONCURRENCY_EXCEEDED',
    CAPACITY: 'CAPACITY_EXCEEDED',
    BUDGET: 'BUDGET_EXCEEDED',
  }
  return reasons[limitType]
}

function validateRequest(request: ResourceUsageRequest, allowZero = false) {
  validateIdentifier(request.resource, 'resource')
  validateAmount(request.amount, allowZero)
  if (request.operationId && request.operationId.length > 200) {
    throw new ResourceGuardError('Operation ID cannot exceed 200 characters', 400)
  }
}

function validateIdentifier(value: string, label: string) {
  if (!value?.trim()) throw new ResourceGuardError(`${label} is required`, 400)
}

function validateAmount(amount: number, allowZero = false) {
  if (!Number.isFinite(amount) || (allowZero ? amount < 0 : amount <= 0)) {
    throw new ResourceGuardError(
      `Resource amount must be ${allowZero ? 'non-negative' : 'positive'}`,
      400
    )
  }
}

function normalizeTtl(value: number | undefined, fallback: number) {
  return value === undefined ? fallback : Math.max(1, Math.min(Math.floor(value), 86_400))
}

function numberMetadata(value: unknown) {
  return typeof value === 'number' ? value : undefined
}

function readJson<T>(value: T | string): T {
  return (typeof value === 'string' ? JSON.parse(value) : value) as T
}

function hydrateStates(states: PolicyState[]) {
  return states.map((state) => ({
    ...state,
    policy: {
      ...state.policy,
      createdAt: new Date(state.policy.createdAt),
      updatedAt: new Date(state.policy.updatedAt),
      validFrom: state.policy.validFrom ? new Date(state.policy.validFrom) : state.policy.validFrom,
      validUntil: state.policy.validUntil
        ? new Date(state.policy.validUntil)
        : state.policy.validUntil,
    },
  }))
}

function sanitizeMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) return undefined
  const blocked = /(password|secret|token|otp|aadhaar|pan)/i
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !blocked.test(key)))
}

function deterministicUuid(value: string) {
  const hex = createHash('sha256').update(value).digest('hex').slice(0, 32).split('')
  hex[12] = '4'
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16)
  const normalized = hex.join('')
  return `${normalized.slice(0, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12, 16)}-${normalized.slice(16, 20)}-${normalized.slice(20)}`
}

function safetyCallerScope(request: ResourceUsageRequest): {
  type: ResourceScopeType
  id: string | null
} {
  if (request.context.userId) return { type: 'USER', id: request.context.userId }
  if (request.context.agencyId) return { type: 'AGENCY', id: request.context.agencyId }
  if (request.context.ipAddress) return { type: 'IP', id: request.context.ipAddress }
  return { type: 'GLOBAL', id: null }
}
