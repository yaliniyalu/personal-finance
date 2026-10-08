import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class MfaMethod extends BaseModel {
  static table = 'mfa_methods'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare methodType: string

  @column()
  declare isEnabled: boolean

  @column()
  declare isPrimary: boolean

  @column({ serializeAs: null })
  declare secretEncrypted: string | null

  @column({ serializeAs: null })
  declare credentialId: string | null

  @column({ serializeAs: null })
  declare publicKey: string | null

  @column({ serializeAs: null })
  declare counter: number | null

  @column({ serializeAs: null })
  declare aaguid: string | null

  @column({ serializeAs: null })
  declare transports: string | null

  @column()
  declare mobileId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare lastUsedAt: DateTime | null
}
