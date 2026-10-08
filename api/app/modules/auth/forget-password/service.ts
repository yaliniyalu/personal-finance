import * as bip39 from 'bip39'
import * as twoFactor from 'node-2fa'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import BadRequest from '#exceptions/bad-request'
import Unauthorized from '#exceptions/unauthorized'
import MfaMethod from '#models/mfa-method'
import User from '#models/user'
import UserEmail from '#models/user-email'
import UserMobile from '#models/user-mobile'
import UserSession from '#models/user-session'
import AuthTokenService from '#services/auth-token-service'
import OtpService from '#services/otp-service'

@inject()
export default class ForgetPasswordService {
  constructor(
    private readonly otpService: OtpService,
    private readonly authTokenService: AuthTokenService
  ) {}

  async request(email: string) {
    const userEmail = await UserEmail.query().where('email', email.trim()).first()
    if (!userEmail) {
      return { sent: true }
    }

    const user = await User.find(userEmail.userId)
    if (!user) {
      return { sent: true }
    }

    const normalizedEmail = userEmail.email.trim().toLowerCase()
    const { challenge, code } = await this.otpService.createChallenge({
      userId: user.id,
      challengeType: 'password_reset',
      destination: normalizedEmail,
    })

    const magicLinkToken = await this.authTokenService.issuePasswordResetMagicLinkToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: normalizedEmail,
    })

    return {
      sent: true,
      challengeId: challenge.id,
      destination: normalizedEmail,
      requires2fa: (await this.getEnabled2faMethods(user.id)).length > 0,
      magicLinkToken,
      otpCode: process.env.NODE_ENV === 'production' ? undefined : code,
    }
  }

  async verifyOtp(challengeId: string, code: string) {
    const result = await this.otpService.verifyCode({ challengeId, code })
    if (!result.ok) {
      throw new Unauthorized('Invalid OTP', result.reason)
    }

    if (result.challenge.challengeType !== 'password_reset') {
      throw new Unauthorized('Invalid OTP challenge', 'INVALID_OTP_CHALLENGE')
    }

    if (!result.challenge.userId) {
      throw new Unauthorized('Invalid OTP challenge', 'INVALID_OTP_CHALLENGE')
    }

    const user = await User.find(result.challenge.userId)
    if (!user) {
      throw new Unauthorized('Invalid OTP challenge', 'INVALID_OTP_CHALLENGE')
    }

    return this.createResetStep(user)
  }

  async verifyMagicLink(token: string) {
    let payload
    try {
      payload = await this.authTokenService.verifyPasswordResetMagicLinkToken(token)
    } catch {
      throw new Unauthorized('Invalid magic link', 'MAGIC_LINK_INVALID')
    }

    const user = await User.find(payload.sub)
    if (!user || user.tenantId !== payload.tenant_id) {
      throw new Unauthorized('Invalid magic link', 'MAGIC_LINK_INVALID')
    }

    const userEmail = await UserEmail.query()
      .where('user_id', user.id)
      .where('email', payload.email)
      .first()

    if (!userEmail) {
      throw new Unauthorized('Invalid magic link', 'MAGIC_LINK_INVALID')
    }

    return this.createResetStep(user)
  }

  async get2faFlow(email: string) {
    const userEmail = await UserEmail.query().where('email', email.trim()).first()
    if (!userEmail) {
      return {
        exists: false,
        requires2fa: false,
        methods: [],
      }
    }

    const user = await User.find(userEmail.userId)
    if (!user) {
      return {
        exists: false,
        requires2fa: false,
        methods: [],
      }
    }

    const methods = await this.getEnabled2faMethods(user.id)
    return {
      exists: true,
      requires2fa: methods.length > 0,
      methods,
    }
  }

  async request2fa(challengeToken: string, method: 'sms' | 'totp') {
    const user = await this.resolveUserFromResetChallenge(challengeToken)

    const methods = await this.getEnabled2faMethods(user.id)
    if (!methods.includes(method)) {
      throw new Unauthorized('2FA method is not enabled', 'TWO_FA_METHOD_NOT_ENABLED')
    }

    if (method === 'totp') {
      return { method, challengeRequired: false }
    }

    const destination = await this.resolveUserSmsDestination(user.id)
    const { challenge, code } = await this.otpService.createChallenge({
      userId: user.id,
      challengeType: 'mfa',
      destination,
    })

    return {
      method,
      challengeRequired: true,
      challengeId: challenge.id,
      destination,
      otpCode: process.env.NODE_ENV === 'production' ? undefined : code,
    }
  }

  async verify2fa(input: {
    challengeToken: string
    method: 'sms' | 'totp'
    code: string
    challengeId?: string
  }) {
    const user = await this.resolveUserFromResetChallenge(input.challengeToken)

    const methods = await this.getEnabled2faMethods(user.id)
    if (!methods.includes(input.method)) {
      throw new Unauthorized('2FA method is not enabled', 'TWO_FA_METHOD_NOT_ENABLED')
    }

    if (input.method === 'sms') {
      if (!input.challengeId) {
        throw new BadRequest('challengeId is required for SMS 2FA', 'CHALLENGE_REQUIRED')
      }

      const result = await this.otpService.verifyCode({
        challengeId: input.challengeId,
        code: input.code,
      })

      if (!result.ok) {
        throw new Unauthorized('Invalid 2FA code', result.reason)
      }

      if (result.challenge.challengeType !== 'mfa' || result.challenge.userId !== user.id) {
        throw new Unauthorized('Invalid 2FA challenge', 'INVALID_2FA_CHALLENGE')
      }
    }

    if (input.method === 'totp') {
      const method = await MfaMethod.query()
        .where('user_id', user.id)
        .where('method_type', 'totp')
        .where('is_enabled', true)
        .first()

      if (!method?.secretEncrypted) {
        throw new Unauthorized('TOTP is not configured', 'TOTP_NOT_CONFIGURED')
      }

      const valid = this.verifyTotp(method.secretEncrypted, input.code)
      if (!valid) {
        throw new Unauthorized('Invalid 2FA code', 'INVALID_TOTP_CODE')
      }

      method.lastUsedAt = DateTime.utc()
      await method.save()
    }

    const resetToken = await this.authTokenService.issuePasswordResetToken({
      userId: user.id,
      tenantId: user.tenantId,
    })

    return {
      status: 'ready_to_reset',
      resetToken,
    }
  }

  async resetPassword(resetToken: string, newPassword: string) {
    let payload
    try {
      payload = await this.authTokenService.verifyPasswordResetToken(resetToken)
    } catch {
      throw new Unauthorized('Invalid reset token', 'RESET_TOKEN_INVALID')
    }

    const user = await User.find(payload.sub)
    if (!user || user.tenantId !== payload.tenant_id) {
      throw new Unauthorized('Invalid reset token', 'RESET_TOKEN_INVALID')
    }

    user.passwordHash = newPassword
    await user.save()

    await UserSession.query().where('user_id', user.id).whereNull('revoked_at').update({
      revokedAt: DateTime.utc(),
    })

    return {
      passwordChanged: true,
    }
  }

  private async createResetStep(user: User) {
    const methods = await this.getEnabled2faMethods(user.id)
    if (methods.length > 0) {
      const challengeToken = await this.authTokenService.issuePasswordResetChallengeToken({
        userId: user.id,
        tenantId: user.tenantId,
      })

      return {
        status: 'requires_2fa',
        methods,
        challengeToken,
      }
    }

    const resetToken = await this.authTokenService.issuePasswordResetToken({
      userId: user.id,
      tenantId: user.tenantId,
    })

    return {
      status: 'ready_to_reset',
      resetToken,
    }
  }

  private async resolveUserFromResetChallenge(challengeToken: string) {
    let payload
    try {
      payload = await this.authTokenService.verifyPasswordResetChallengeToken(challengeToken)
    } catch {
      throw new Unauthorized('Invalid reset challenge', 'RESET_CHALLENGE_INVALID')
    }

    const user = await User.find(payload.sub)
    if (!user || user.tenantId !== payload.tenant_id) {
      throw new Unauthorized('Invalid reset challenge', 'RESET_CHALLENGE_INVALID')
    }

    return user
  }

  private async getEnabled2faMethods(userId: string) {
    const methods = await MfaMethod.query().where('user_id', userId).where('is_enabled', true)
    return methods
      .map((method) => method.methodType)
      .filter((method): method is 'sms' | 'totp' => method === 'sms' || method === 'totp')
  }

  private async resolveUserSmsDestination(userId: string) {
    const primaryMobile = await UserMobile.query()
      .where('user_id', userId)
      .where('is_primary', true)
      .first()

    if (!primaryMobile) {
      throw new BadRequest('No primary mobile found for SMS 2FA', 'SMS_DESTINATION_MISSING')
    }

    return primaryMobile.mobileNumber
  }

  private verifyTotp(secret: string, token: string) {
    const normalizedToken = token.trim()
    if (!/^\d{6}$/.test(normalizedToken)) {
      return false
    }

    const normalizedSecret = this.normalizeTotpSecret(secret)
    const verification = twoFactor.verifyToken(normalizedSecret, normalizedToken, 1)
    return verification !== null
  }

  private normalizeTotpSecret(secret: string) {
    const trimmed = secret.trim()

    if (bip39.validateMnemonic(trimmed)) {
      const entropyHex = bip39.mnemonicToEntropy(trimmed)
      return this.encodeBase32(Buffer.from(entropyHex, 'hex'))
    }

    return trimmed.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '')
  }

  private encodeBase32(buffer: Buffer) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = ''
    for (const byte of buffer) {
      bits += byte.toString(2).padStart(8, '0')
    }

    let output = ''
    for (let i = 0; i < bits.length; i += 5) {
      const chunk = bits.slice(i, i + 5)
      if (chunk.length < 5) {
        output += alphabet[Number.parseInt(chunk.padEnd(5, '0'), 2)]
        break
      }

      output += alphabet[Number.parseInt(chunk, 2)]
    }

    return output
  }
}
