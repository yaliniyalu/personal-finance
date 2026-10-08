export type ResourceKey = string

export type ResourceLimitType = 'RATE' | 'QUOTA' | 'CONCURRENCY' | 'CAPACITY' | 'BUDGET'
export type ResourceScopeType = 'GLOBAL' | 'PLAN' | 'AGENCY' | 'USER' | 'LISTING' | 'IP'
export type ResourceWindowUnit = 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH'
export type ResourcePolicyEnforcement = 'HARD' | 'SOFT'

export interface ResourcePolicy {
  id: string
  resource: ResourceKey
  dimensions?: Record<string, string>
  scopeType: ResourceScopeType
  scopeId?: string | null
  limitType: ResourceLimitType
  limit: number
  window?: { size: number; unit: ResourceWindowUnit }
  enforcement: ResourcePolicyEnforcement
  priority?: number
  enabled: boolean
  validFrom?: Date | null
  validUntil?: Date | null
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface ResourceContext {
  userId?: string
  agencyId?: string
  planId?: string
  listingId?: string
  ipAddress?: string
}

export interface ResourceUsageRequest {
  resource: ResourceKey
  amount: number
  dimensions?: Record<string, string>
  context: ResourceContext
  operationId?: string
  metadata?: Record<string, unknown>
}

export type ResourceDenialReason =
  | 'RATE_LIMIT_EXCEEDED'
  | 'QUOTA_EXCEEDED'
  | 'CONCURRENCY_EXCEEDED'
  | 'CAPACITY_EXCEEDED'
  | 'BUDGET_EXCEEDED'
  | 'RESOURCE_DISABLED'
  | 'ENTITLEMENT_REQUIRED'

export interface ResourceLimitResult {
  allowed: boolean
  reason?: ResourceDenialReason
  policyId?: string
  limit?: number
  consumed?: number
  remaining?: number
  retryAfterSeconds?: number
  resetAt?: Date
  matchedPolicies?: string[]
}

export interface ResourceReservationRequest extends ResourceUsageRequest {
  expiresInSeconds?: number
}

export interface ResourceReservation {
  id: string
  resource: ResourceKey
  reservedAmount: number
  expiresAt: Date
}

export interface ResourceLease {
  id: string
  resource: ResourceKey
  acquiredAt: Date
  expiresAt: Date
}

export interface ResourceUsageQuery {
  resource: ResourceKey
  dimensions?: Record<string, string>
  context: ResourceContext
}

export interface ResourceUsageSnapshot {
  resource: ResourceKey
  consumed: number
  reserved: number
  limit?: number
  remaining?: number
  periodStart?: Date
  periodEnd?: Date
}

export interface ResourceGuardServiceContract {
  check(request: ResourceUsageRequest): Promise<ResourceLimitResult>
  consume(request: ResourceUsageRequest): Promise<ResourceLimitResult>
  reserve(request: ResourceReservationRequest): Promise<ResourceReservation>
  settle(reservationId: string, actualAmount: number): Promise<void>
  release(reservationId: string): Promise<void>
  acquire(request: ResourceUsageRequest): Promise<ResourceLease>
  releaseLease(leaseId: string): Promise<void>
  getUsage(query: ResourceUsageQuery): Promise<ResourceUsageSnapshot>
  resolvePolicies(request: ResourceUsageRequest): Promise<ResourcePolicy[]>
}
