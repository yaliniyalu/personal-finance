import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class UserEmail extends BaseModel {
  static table = 'user_emails'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare tenantId: string

  @column()
  declare email: string

  @column()
  declare isPrimary: boolean

  @column()
  declare isVerified: boolean

  @column.dateTime()
  declare verifiedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
