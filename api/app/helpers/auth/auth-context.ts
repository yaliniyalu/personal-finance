import TenantCtx from '#helpers/auth/tenant-ctx'
import UserCtx from '#helpers/auth/user-ctx'
import User from '#models/user'
import { resolvePublicUrl } from '#helpers/public-url-resolver'
import { type DriveDisks } from '@adonisjs/drive/types'
import Tenant from '#models/tenant'

export default class AuthContext {
  private userCtx?: UserCtx

  constructor(public readonly tenant: TenantCtx) {}

  get user() {
    if (!this.userCtx) {
      throw new Error('User is not set in AuthCtx')
    }
    return this.userCtx
  }

  async setUser(user: UserCtx) {
    this.userCtx = user
  }

  async getPublicUrl(key: string, disk?: keyof DriveDisks): Promise<string> {
    return resolvePublicUrl(key, disk)
  }

  async getPublicUrlOrNull(key?: string | null, disk?: keyof DriveDisks): Promise<string | null> {
    if (!key) {
      return null
    }

    return resolvePublicUrl(key, disk)
  }

  ensureUser(): asserts this is this & { user: UserCtx } {
    if (!this.userCtx) {
      throw new Error('User is not authenticated')
    }
  }

  isAuthenticated(): boolean {
    return !!this.userCtx
  }

  static async make(opts: MakeOptions): Promise<AuthContext> {
    if (!opts.tenant) {
      throw new Error('Tenant is not set')
    }

    let tenant: TenantCtx
    if (opts.tenant instanceof TenantCtx) {
      tenant = opts.tenant
    } else if (opts.tenant instanceof Tenant) {
      tenant = await TenantCtx.fromDoc(opts.tenant)
    } else {
      tenant = await TenantCtx.fromId(opts.tenant)
    }

    let user: UserCtx | undefined
    if (opts.user instanceof UserCtx) {
      user = opts.user
    } else if (opts.user instanceof User) {
      user = await UserCtx.fromDoc(opts.user)
    } else if (typeof opts.user === 'string') {
      user = await UserCtx.fromId(opts.user)
    }

    const authCtx = new AuthContext(tenant)
    if (user) {
      await authCtx.setUser(user)
    }

    return authCtx
  }

  asPayload(): Record<string, any> {
    return {
      tenant: this.tenant.id,
      user: this.userCtx?.id,
    }
  }
}

interface MakeOptions {
  tenant: TenantCtx | string | Tenant
  user?: UserCtx | string | User
}
