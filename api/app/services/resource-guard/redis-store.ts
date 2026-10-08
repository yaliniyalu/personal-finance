import { createHash, randomUUID } from 'node:crypto'
import redis from '@adonisjs/redis/services/main'
import type { ResourcePolicy, ResourceUsageRequest, ResourceWindowUnit } from './contracts.js'
import { scopeIdFor } from './policy-repository.js'
import {
  APPLY_USAGE_SCRIPT,
  FINALIZE_RESERVATION_SCRIPT,
  RELEASE_LEASE_SCRIPT,
} from './redis-scripts.js'

export default class ResourceGuardRedisStore {
  buildStates(request: ResourceUsageRequest, policies: ResourcePolicy[], now = Date.now()) {
    const routeTag = hash(`${request.resource}:${stableObject(request.dimensions ?? {})}`).slice(
      0,
      24
    )

    return policies.map((policy) => {
      const period = policy.window
        ? windowBounds(now, policy.window.size, policy.window.unit)
        : undefined
      const scopeId = scopeIdFor(policy.scopeType, request.context) ?? 'missing'
      const identity = hash(`${policy.id}:${policy.scopeType}:${scopeId}:${period?.start ?? 'all'}`)
      const base = `resource-guard:{${routeTag}}:${identity}`
      return {
        policy,
        hashKey: `${base}:usage`,
        expiryKey: `${base}:expirations`,
        periodStart: period?.start,
        periodEnd: period?.end,
      } satisfies PolicyState
    })
  }

  async apply(params: {
    request: ResourceUsageRequest
    states: PolicyState[]
    mode: StoreMode
    entryId?: string
    entryExpiresAt?: number
  }): Promise<StoreResult> {
    const keys = params.states.flatMap((state) => [state.hashKey, state.expiryKey])
    const markerKey = markerKeyFor(
      params.states,
      `operation:${params.request.operationId ?? randomUUID()}`
    )
    keys.push(markerKey)
    const maxPeriod = Math.max(
      60_000,
      ...params.states.map((state) => (state.periodEnd ? state.periodEnd - Date.now() : 86_400_000))
    )
    const payload = {
      mode: params.mode,
      amount: params.request.amount,
      now: Date.now(),
      entryId: params.entryId,
      entryExpiresAt: params.entryExpiresAt,
      persistMarker: params.mode !== 'check' && Boolean(params.request.operationId),
      markerTtl: Math.min(Math.max(maxPeriod, 60_000), 2_592_000_000),
      policies: params.states.map((state) => ({
        limit: state.policy.limit,
        limitType: state.policy.limitType,
        enforcement: state.policy.enforcement,
        periodEnd: state.periodEnd,
      })),
    }

    return runScript(APPLY_USAGE_SCRIPT, keys, payload)
  }

  async finalizeReservation(
    states: PolicyState[],
    reservationId: string,
    mode: 'settle' | 'release',
    actualAmount = 0
  ) {
    const keys = states.flatMap((state) => [state.hashKey, state.expiryKey])
    keys.push(markerKeyFor(states, `reservation:${mode}:${reservationId}`))
    return runScript(FINALIZE_RESERVATION_SCRIPT, keys, {
      mode,
      entryId: reservationId,
      actualAmount,
      policies: states.map((state) => ({
        limit: state.policy.limit,
        enforcement: state.policy.enforcement,
      })),
    })
  }

  async releaseLease(states: PolicyState[], leaseId: string) {
    const keys = states.flatMap((state) => [state.hashKey, state.expiryKey])
    keys.push(markerKeyFor(states, `lease:release:${leaseId}`))
    return runScript(RELEASE_LEASE_SCRIPT, keys, { entryId: leaseId })
  }
}

export type StoreMode = 'check' | 'consume' | 'reserve' | 'acquire'

export interface PolicyState {
  policy: ResourcePolicy
  hashKey: string
  expiryKey: string
  periodStart?: number
  periodEnd?: number
}

export interface StoreMetric {
  consumed: number
  reserved: number
  concurrency: number
  projected: number
}

export interface StoreResult {
  allowed: boolean
  blocked: number
  found?: number
  metrics?: StoreMetric[]
}

async function runScript(script: string, keys: string[], payload: unknown): Promise<StoreResult> {
  const result = await redis.eval(script, keys.length, ...keys, JSON.stringify(payload))
  if (typeof result !== 'string')
    throw new Error('Resource guard received an invalid Redis response')
  return JSON.parse(result) as StoreResult
}

function markerKeyFor(states: PolicyState[], suffix: string) {
  const tag = /\{([^}]+)\}/.exec(states[0]?.hashKey ?? '')?.[1] ?? hash(suffix).slice(0, 24)
  return `resource-guard:{${tag}}:marker:${hash(suffix)}`
}

function windowBounds(now: number, size: number, unit: ResourceWindowUnit) {
  if (!Number.isInteger(size) || size <= 0)
    throw new Error('Resource policy window size must be positive')
  const fixedUnitMs: Partial<Record<string, number>> = {
    SECOND: 1_000,
    MINUTE: 60_000,
    HOUR: 3_600_000,
    DAY: 86_400_000,
    WEEK: 604_800_000,
  }
  const unitMs = fixedUnitMs[unit]
  if (unitMs) {
    const duration = unitMs * size
    const origin = unit === 'WEEK' ? Date.UTC(1970, 0, 5) : 0
    const start = origin + Math.floor((now - origin) / duration) * duration
    return { start, end: start + duration }
  }

  const date = new Date(now)
  const absoluteMonth = date.getUTCFullYear() * 12 + date.getUTCMonth()
  const startMonth = Math.floor(absoluteMonth / size) * size
  const start = Date.UTC(Math.floor(startMonth / 12), startMonth % 12, 1)
  const endMonth = startMonth + size
  const end = Date.UTC(Math.floor(endMonth / 12), endMonth % 12, 1)
  return { start, end }
}

function stableObject(value: Record<string, string>) {
  return JSON.stringify(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)))
}

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}
