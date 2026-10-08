import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class UserSession extends BaseModel {
  static table = 'user_sessions'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column({ serializeAs: null })
  declare refreshTokenHash: string

  @column()
  declare deviceName: string | null

  @column()
  declare deviceOs: string | null

  @column()
  declare browser: string | null

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare location: string | null

  @column.dateTime()
  declare revokedAt: DateTime | null

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare lastSeenAt: DateTime | null
}
