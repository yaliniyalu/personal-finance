import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, beforeSave, column, hasMany, scope } from '@adonisjs/lucid/orm'
import Tenant from '#models/tenant'
import UserEmail from '#models/user-email'
import UserMobile from '#models/user-mobile'

export default class User extends BaseModel {
  static table = 'users'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare tenantId: string

  @column()
  declare userType: string

  @column()
  declare name: string | null

  @column()
  declare status: string

  @column()
  declare primaryEmailId: string | null

  @column()
  declare primaryMobileId: string | null

  @column({ serializeAs: null })
  declare passwordHash: string | null

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Tenant, {
    localKey: 'tenantId',
    foreignKey: 'id',
  })
  declare tenant: any

  @hasMany(() => UserEmail, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  declare emails: any

  @hasMany(() => UserMobile, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  declare mobiles: any

  static active = scope((query) => query.where('status', 'active').whereNull('deleted_at'))

  static async verifyPassword(user: User, password: string) {
    if (!user.passwordHash) {
      return false
    }

    return hash.verify(user.passwordHash, password)
  }

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.passwordHash && user.passwordHash) {
      user.passwordHash = await hash.make(user.passwordHash)
    }
  }
}
