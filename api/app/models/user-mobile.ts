import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class UserMobile extends BaseModel {
  static table = 'user_mobiles'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare tenantId: string

  @column()
  declare countryCode: string | null

  @column()
  declare mobileNumber: string

  @column()
  declare isPrimary: boolean

  @column()
  declare isVerified: boolean

  @column.dateTime()
  declare verifiedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
