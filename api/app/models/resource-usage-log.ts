import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type ResourceAction =
  | 'CHECK'
  | 'CONSUME'
  | 'RESERVE'
  | 'SETTLE'
  | 'RELEASE'
  | 'ACQUIRE'
  | 'RELEASE_LEASE'
  | 'EXECUTE'

export type ResourceStatus = 'success' | 'denied' | 'failure'

export default class ResourceUsageLog extends BaseModel {
  static table = 'resource_usage_logs'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare resourceType: string

  @column()
  declare action: ResourceAction

  @column()
  declare status: ResourceStatus

  @column()
  declare userId: string | null

  @column()
  declare tenantId: string | null

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare durationMs: number | null

  @column()
  declare details: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
