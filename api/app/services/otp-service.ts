import { randomInt } from 'node:crypto'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import OtpChallenge from '#models/otp-challenge'

@inject()
export default class OtpService {
  private readonly otpTtlMinutes = Number(process.env.OTP_TTL_MINUTES ?? 5)
  private readonly otpMaxAttempts = Number(process.env.OTP_MAX_ATTEMPTS ?? 5)

  async createChallenge(input: {
    userId?: string | null
    challengeType: string
    destination?: string | null
  }) {
    const code = String(randomInt(100000, 999999))

    const challenge = await OtpChallenge.create({
      userId: input.userId ?? null,
      challengeType: input.challengeType,
      destination: input.destination ?? null,
      codeHash: await hash.make(code),
      maxAttempts: this.otpMaxAttempts,
      attemptCount: 0,
      expiresAt: DateTime.utc().plus({ minutes: this.otpTtlMinutes }),
    })

    return { challenge, code }
  }

  async verifyCode(input: { challengeId: string; code: string }) {
    const challenge = await OtpChallenge.find(input.challengeId)
    if (!challenge) {
      return { ok: false as const, reason: 'not_found' as const }
    }

    if (challenge.verifiedAt) {
      return { ok: false as const, reason: 'already_verified' as const }
    }

    if (challenge.expiresAt <= DateTime.utc()) {
      return { ok: false as const, reason: 'expired' as const }
    }

    if (challenge.attemptCount >= challenge.maxAttempts) {
      return { ok: false as const, reason: 'too_many_attempts' as const }
    }

    const valid = await hash.verify(challenge.codeHash, input.code)
    if (!valid) {
      challenge.attemptCount = challenge.attemptCount + 1
      await challenge.save()
      return { ok: false as const, reason: 'invalid_code' as const }
    }

    challenge.verifiedAt = DateTime.utc()
    await challenge.save()

    return { ok: true as const, challenge }
  }
}
