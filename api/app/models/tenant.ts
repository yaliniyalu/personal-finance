import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Tenant extends BaseModel {
  static table = 'tenants'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare username: string

  @column()
  declare name: string

  @column()
  declare organizationType: string

  @column()
  declare contactName: string

  @column()
  declare email: string

  @column()
  declare mobileNumber: string

  @column()
  declare countryCode: string | null

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
