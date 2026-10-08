import type { NextFn } from '@adonisjs/core/types/http'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Unauthorized from '#exceptions/unauthorized'
import User from '#models/user'
import type UserSession from '#models/user-session'
import AuthTokenService, { type AccessTokenPayload } from '#services/auth-token-service'
import SessionService from '#services/session-service'

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    authUser?: User
    authSession?: UserSession
    authJwtPayload?: AccessTokenPayload
  }
}

@inject()
export default class JwtAuthMiddleware {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly sessionService: SessionService
  ) {}

  async handle(ctx: HttpContext, next: NextFn) {
    const authHeader = ctx.request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Unauthorized('Missing bearer token', 'TOKEN_MISSING')
    }

    const token = authHeader.slice(7).trim()
    if (!token) {
      throw new Unauthorized('Missing bearer token', 'TOKEN_MISSING')
    }

    let payload: AccessTokenPayload

    try {
      payload = await this.authTokenService.verifyAccessToken(token)
    } catch {
      throw new Unauthorized('Invalid access token', 'TOKEN_INVALID')
    }

    const session = await this.sessionService.assertSessionIsActive(payload.session_id)
    if (!session) {
      throw new Unauthorized('Session is no longer active', 'SESSION_REVOKED')
    }

    const user = await User.query()
      .where('id', payload.sub)
      .where('tenant_id', payload.tenant_id)
      .first()

    if (!user) {
      throw new Unauthorized('Invalid access token user', 'USER_NOT_FOUND')
    }

    ctx.authUser = user
    ctx.authSession = session
    ctx.authJwtPayload = payload

    await this.sessionService.touchSession(session.id)

    return next()
  }
}
