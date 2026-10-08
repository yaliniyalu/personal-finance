import { createHash, randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import UserSession from '#models/user-session'

@inject()
export default class SessionService {
  private readonly sessionTtlDays = Number(process.env.SESSION_TTL_DAYS ?? 30)

  async createSession(input: {
    userId: string
    userAgent?: string | null
    ipAddress?: string | null
    deviceName?: string | null
    deviceOs?: string | null
    browser?: string | null
    location?: string | null
  }) {
    const refreshTokenHash = createHash('sha256').update(randomUUID()).digest('hex')

    return UserSession.create({
      userId: input.userId,
      refreshTokenHash,
      userAgent: input.userAgent ?? null,
      ipAddress: input.ipAddress ?? null,
      deviceName: input.deviceName ?? null,
      deviceOs: input.deviceOs ?? null,
      browser: input.browser ?? null,
      location: input.location ?? null,
      expiresAt: DateTime.utc().plus({ days: this.sessionTtlDays }),
      lastSeenAt: DateTime.utc(),
    })
  }

  async touchSession(sessionId: string) {
    const session = await UserSession.find(sessionId)
    if (!session) {
      return null
    }

    session.lastSeenAt = DateTime.utc()
    await session.save()
    return session
  }

  async revokeSession(sessionId: string) {
    const session = await UserSession.find(sessionId)
    if (!session || session.revokedAt) {
      return false
    }

    session.revokedAt = DateTime.utc()
    await session.save()
    return true
  }

  async assertSessionIsActive(sessionId: string) {
    const session = await UserSession.find(sessionId)

    if (!session) {
      return null
    }

    if (session.revokedAt) {
      return null
    }

    if (session.expiresAt <= DateTime.utc()) {
      return null
    }

    return session
  }
}
