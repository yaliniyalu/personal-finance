import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class File extends BaseModel {
  static table = 'files'

  @column()
  declare checksum: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare expiry: DateTime | null

  @column()
  declare extension: string

  @column()
  declare genericType: string

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare key: string

  @column()
  declare metadata: any | null

  @column()
  declare mimeType: string

  @column()
  declare originalName: string

  @column()
  declare size: bigint | number

  @column()
  declare storage: string

  @column()
  declare tenantId: string | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare userId: string | null
}
