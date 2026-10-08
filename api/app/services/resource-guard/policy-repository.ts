import db from '@adonisjs/lucid/services/db'
import type {
  ResourceContext,
  ResourceLimitType,
  ResourcePolicy,
  ResourceScopeType,
  ResourceUsageRequest,
  ResourceWindowUnit,
} from './contracts.js'

const SCOPE_PRIORITY: Record<ResourceScopeType, number> = {
  GLOBAL: 0,
  PLAN: 1,
  AGENCY: 2,
  USER: 3,
  LISTING: 4,
  IP: 5,
}

export default class ResourcePolicyRepository {
  async resolve(
    request: ResourceUsageRequest,
    injectedSafetyPolicies: ResourcePolicy[]
  ): Promise<ResourcePolicy[]> {
    const rows = await db
      .from('resource_policies')
      .where('resource', request.resource)
      .where('enabled', true)
      .where((query) => query.whereNull('valid_from').orWhere('valid_from', '<=', new Date()))
      .where((query) => query.whereNull('valid_until').orWhere('valid_until', '>', new Date()))

    const applicable = rows
      .map(toPolicy)
      .filter((policy) => scopeMatches(policy, request.context))
      .filter((policy) => dimensionsMatch(policy.dimensions, request.dimensions))

    const storedSafetyPolicies = applicable.filter(
      (policy) => policy.metadata?.isSafetyLimit === true
    )
    const businessPolicies = applicable.filter((policy) => policy.metadata?.isSafetyLimit !== true)
    const selected = new Map<string, ResourcePolicy>()

    for (const policy of businessPolicies) {
      const key = overrideKey(policy)
      const current = selected.get(key)
      if (!current || comparePrecedence(policy, current) > 0) {
        selected.set(key, policy)
      }
    }

    return [...storedSafetyPolicies, ...injectedSafetyPolicies, ...selected.values()].sort(
      (left, right) =>
        SCOPE_PRIORITY[left.scopeType] - SCOPE_PRIORITY[right.scopeType] ||
        (right.priority ?? 0) - (left.priority ?? 0)
    )
  }
}

function toPolicy(row: Record<string, any>): ResourcePolicy {
  return {
    id: row.id,
    resource: row.resource,
    dimensions: readJson(row.dimensions),
    scopeType: row.scope_type,
    scopeId: row.scope_id,
    limitType: row.limit_type as ResourceLimitType,
    limit: Number(row.limit),
    window:
      row.window_size && row.window_unit
        ? { size: Number(row.window_size), unit: row.window_unit as ResourceWindowUnit }
        : undefined,
    enforcement: row.enforcement,
    priority: Number(row.priority ?? 0),
    enabled: row.enabled,
    validFrom: row.valid_from ? new Date(row.valid_from) : null,
    validUntil: row.valid_until ? new Date(row.valid_until) : null,
    metadata: readJson(row.metadata),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function scopeMatches(policy: ResourcePolicy, context: ResourceContext) {
  if (policy.scopeType === 'GLOBAL') return policy.scopeId === null || policy.scopeId === undefined
  return policy.scopeId === scopeIdFor(policy.scopeType, context)
}

export function scopeIdFor(scopeType: ResourceScopeType, context: ResourceContext) {
  const values: Record<ResourceScopeType, string | undefined> = {
    GLOBAL: 'global',
    PLAN: context.planId,
    AGENCY: context.agencyId,
    USER: context.userId,
    LISTING: context.listingId,
    IP: context.ipAddress,
  }
  return values[scopeType]
}

function dimensionsMatch(
  policyDimensions?: Record<string, string>,
  requestDimensions?: Record<string, string>
) {
  if (!policyDimensions || Object.keys(policyDimensions).length === 0) return true
  return Object.entries(policyDimensions).every(
    ([key, value]) => requestDimensions?.[key] === value
  )
}

function overrideKey(policy: ResourcePolicy) {
  const window = policy.window ? `${policy.window.size}:${policy.window.unit}` : 'none'
  return `${policy.limitType}:${window}:${stableObject(policy.dimensions ?? {})}`
}

function comparePrecedence(left: ResourcePolicy, right: ResourcePolicy) {
  return (
    SCOPE_PRIORITY[left.scopeType] - SCOPE_PRIORITY[right.scopeType] ||
    (left.priority ?? 0) - (right.priority ?? 0) ||
    left.updatedAt.getTime() - right.updatedAt.getTime()
  )
}

function stableObject(value: Record<string, string>) {
  return JSON.stringify(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)))
}

function readJson<T>(value: T | string | null): T | undefined {
  if (value === null || value === undefined) return undefined
  return (typeof value === 'string' ? JSON.parse(value) : value) as T
}
