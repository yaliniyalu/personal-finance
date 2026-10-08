import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OtpChallenge extends BaseModel {
  static table = 'otp_challenges'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string | null

  @column()
  declare challengeType: string

  @column()
  declare destination: string | null

  @column({ serializeAs: null })
  declare codeHash: string

  @column()
  declare attemptCount: number

  @column()
  declare maxAttempts: number

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime()
  declare verifiedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
