import Unauthorized from '#exceptions/unauthorized'
import { type HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserSession from '#models/user-session'
import AuthTokenService from '#services/auth-token-service'
import { DateTime } from 'luxon'

export default class UserCtx {
  public readonly id: string
  public readonly tenantId: string
  public readonly name: string | null
  public readonly avatarUrl: string | null
  public readonly status: string
  public readonly themePreference: 'system' | 'light' | 'dark'

  constructor(
    public readonly user: User,
    public readonly session: UserSession | null,
    activeTenantId?: string
  ) {
    this.id = user.id
    this.tenantId = activeTenantId || user.tenantId
    this.name = user.name
    this.avatarUrl = user.avatarUrl
    this.status = user.status
    this.themePreference = user.themePreference as 'system' | 'light' | 'dark'
  }

  static async fromId(id: string) {
    const user = await User.findBy('id', id)
    if (!user) {
      throw new Unauthorized('User not found', 'USER_NOT_FOUND')
    }

    return new UserCtx(user, null)
  }

  static async fromDoc(doc: User) {
    return new UserCtx(doc, null)
  }

  static async fromToken(
    token: string,
    { tokenType, tenantId }: { tokenType: string; tenantId: string }
  ) {
    const tokenService = new AuthTokenService()
    const payload = await tokenService.verifyAccessToken(token)
    const user = await User.findBy('id', payload.sub)
    if (!user) {
      throw new Unauthorized('Invalid Token', 'INVALID_TOKEN')
    }

    if (user.status === 'Inactive') {
      throw new Unauthorized('User is inactive', 'USER_INACTIVE')
    }

    const session = await UserSession.find(payload.session_id)
    if (!session) {
      throw new Unauthorized('Session not found', 'INVALID_SESSION')
    }

    if (session.revokedAt) {
      throw new Unauthorized('Session has been revoked. Please log in again.', 'SESSION_REVOKED')
    }

    if (session.expiresAt <= DateTime.utc()) {
      throw new Unauthorized('Session has expired. Please log in again.', 'SESSION_EXPIRED')
    }

    if (session.lastSeenAt) {
      const now = DateTime.utc()
      const inactiveDays = now.diff(session.lastSeenAt, 'days').days
      if (inactiveDays >= 15) {
        session.revokedAt = now
        await session.save()
        throw new Unauthorized(
          'Session has expired due to 15 days of inactivity. Please log in again.',
          'SESSION_EXPIRED'
        )
      }
    }

    if (tenantId.toString() !== payload.tenant_id) {
      throw new Unauthorized('Invalid Token', 'INVALID_TOKEN')
    }

    // Verify user is authorized for payload.tenant_id (either owner or active team member)
    let isAuthorizedTenant = user.tenantId === payload.tenant_id
    if (!isAuthorizedTenant) {
      const db = (await import('@adonisjs/lucid/services/db')).default
      const membership = await db
        .from('crm_team_members')
        .where({ tenant_id: payload.tenant_id, user_id: user.id })
        .whereNot('availability', 'inactive')
        .first()
      if (membership) {
        isAuthorizedTenant = true
      }
    }

    if (!isAuthorizedTenant) {
      throw new Unauthorized('You do not have access to this tenant account', 'TENANT_FORBIDDEN')
    }

    if (payload.token_type !== tokenType) {
      throw new Unauthorized('Invalid Token', 'INVALID_TOKEN')
    }

    // Touch session last seen & extend validity by 15 days as user is using the app
    session.lastSeenAt = DateTime.utc()
    session.expiresAt = DateTime.utc().plus({ days: 15 })
    await session.save()

    return new UserCtx(user, session, payload.tenant_id)
  }

  static getToken(ctx: HttpContext) {
    const token = ctx.request.header('Authorization')
    if (!token) {
      return null
    }

    return token.replace('Bearer ', '')
  }

  getDoc() {
    return this.user
  }
}
