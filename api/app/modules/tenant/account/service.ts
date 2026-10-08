import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import Forbidden from '#exceptions/forbidden'
import NotFound from '#exceptions/not-found'
import UserSession from '#models/user-session'

export interface AccountSessionOutput {
  id: string
  deviceName: string | null
  deviceOs: string | null
  browser: string | null
  ipAddress: string | null
  userAgent: string | null
  location: string | null
  expiresAt: string
  revokedAt: string | null
  createdAt: string
  lastSeenAt: string | null
  isCurrent: boolean
  status: 'active' | 'revoked' | 'expired'
  canRevoke: boolean
}

@inject()
export default class AccountService {
  async listSessions(userId: string, currentSessionId: string): Promise<AccountSessionOutput[]> {
    const sessions = await UserSession.query().where('user_id', userId).orderBy('created_at', 'desc')
    const now = DateTime.utc()

    return sessions.map((session) => {
      const isCurrent = session.id === currentSessionId
      const isExpired = session.expiresAt <= now
      const status = session.revokedAt ? 'revoked' : isExpired ? 'expired' : 'active'

      return {
        id: session.id,
        deviceName: session.deviceName,
        deviceOs: session.deviceOs,
        browser: session.browser,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        location: session.location,
        expiresAt: session.expiresAt.toISO() ?? session.expiresAt.toString(),
        revokedAt: session.revokedAt?.toISO() ?? null,
        createdAt: session.createdAt.toISO() ?? session.createdAt.toString(),
        lastSeenAt: session.lastSeenAt?.toISO() ?? null,
        isCurrent,
        status,
        canRevoke: !isCurrent && status === 'active',
      }
    })
  }

  async revokeSession(userId: string, currentSessionId: string, sessionId: string) {
    const session = await UserSession.query().where('id', sessionId).where('user_id', userId).first()

    if (!session) {
      throw new NotFound('Session not found', 'SESSION_NOT_FOUND')
    }

    if (session.id === currentSessionId) {
      throw new Forbidden('Current session cannot be revoked', 'CURRENT_SESSION_REVOKE_FORBIDDEN')
    }

    if (!session.revokedAt) {
      session.revokedAt = DateTime.utc()
      await session.save()
    }

    return {
      revoked: true as const,
    }
  }
}
