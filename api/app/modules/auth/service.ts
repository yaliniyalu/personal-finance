import * as bip39 from 'bip39'
import * as twoFactor from 'node-2fa'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'
import BadRequest from '#exceptions/bad-request'
import Unauthorized from '#exceptions/unauthorized'
import User from '#models/user'
import UserEmail from '#models/user-email'
import UserMobile from '#models/user-mobile'
import Tenant from '#models/tenant'
import MfaMethod from '#models/mfa-method'
import SessionService from '#services/session-service'
import AuthTokenService from '#services/auth-token-service'
import OtpService from '#services/otp-service'
import SocialAuthService from '#services/social-auth-service'

type RequestMeta = {
  ipAddress?: string | null
  userAgent?: string | null
}

@inject()
export default class AuthService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly authTokenService: AuthTokenService,
    private readonly otpService: OtpService,
    private readonly socialAuthService: SocialAuthService
  ) {}

  async identifyLoginFlow(identifier: string) {
    const user = await this.findUserByIdentifier(identifier)
    if (!user) {
      return {
        nextStep: 'verify',
        exists: false,
      }
    }

    const enabled2fa = await this.getEnabled2faMethods(user.id)

    return {
      nextStep: user.passwordHash ? 'password' : 'otp_or_magic_link',
      exists: true,
      requires2fa: enabled2fa.length > 0,
      methods: enabled2fa,
    }
  }

  async loginWithPassword(identifier: string, password: string, meta: RequestMeta) {
    const user = await this.findUserByIdentifier(identifier)
    if (!user) {
      throw new Unauthorized('Invalid credentials', 'INVALID_CREDENTIALS')
    }

    const validPassword = await User.verifyPassword(user, password)
    if (!validPassword) {
      throw new Unauthorized('Invalid credentials', 'INVALID_CREDENTIALS')
    }

    const mfaMethods = await this.getEnabled2faMethods(user.id)
    if (mfaMethods.length > 0) {
      return {
        status: 'requires_2fa',
        methods: mfaMethods,
      }
    }

    return this.completeLogin(user, meta)
  }

  async requestOtpLogin(identifier: string) {
    const user = await this.findUserByIdentifier(identifier)
    if (!user) {
      throw new Unauthorized('Unable to process login request', 'LOGIN_NOT_ALLOWED')
    }

    const destination = await this.resolveUserOtpDestination(user.id)
    const { challenge, code } = await this.otpService.createChallenge({
      userId: user.id,
      challengeType: 'login',
      destination,
    })

    const magicLinkToken = await this.authTokenService.issueMagicLinkToken({
      userId: user.id,
      tenantId: user.tenantId,
    })

    return {
      challengeId: challenge.id,
      destination,
      magicLinkToken,
      otpCode: process.env.NODE_ENV === 'production' ? undefined : code,
    }
  }

  async verifyOtpLogin(challengeId: string, code: string, meta: RequestMeta) {
    const result = await this.otpService.verifyCode({ challengeId, code })
    if (!result.ok) {
      throw new Unauthorized('Invalid OTP', result.reason)
    }

    if (!result.challenge.userId) {
      throw new Unauthorized('Invalid OTP challenge', 'INVALID_OTP_CHALLENGE')
    }

    const user = await User.find(result.challenge.userId)
    if (!user) {
      throw new Unauthorized('Invalid OTP challenge', 'INVALID_OTP_CHALLENGE')
    }

    const mfaMethods = await this.getEnabled2faMethods(user.id)
    if (mfaMethods.length > 0) {
      return {
        status: 'requires_2fa',
        methods: mfaMethods,
      }
    }

    return this.completeLogin(user, meta)
  }

  async verifyMagicLinkLogin(token: string, meta: RequestMeta) {
    let payload
    try {
      payload = await this.authTokenService.verifyMagicLinkToken(token)
    } catch {
      throw new Unauthorized('Invalid magic link', 'MAGIC_LINK_INVALID')
    }

    const user = await User.find(payload.sub)
    if (!user || user.tenantId !== payload.tenant_id) {
      throw new Unauthorized('Invalid magic link', 'MAGIC_LINK_INVALID')
    }

    const mfaMethods = await this.getEnabled2faMethods(user.id)
    if (mfaMethods.length > 0) {
      return {
        status: 'requires_2fa',
        methods: mfaMethods,
      }
    }

    return this.completeLogin(user, meta)
  }

  async request2fa(identifier: string, method: 'sms' | 'totp') {
    const user = await this.findUserByIdentifier(identifier)
    if (!user) {
      throw new Unauthorized('Invalid 2FA request', 'INVALID_2FA_REQUEST')
    }

    if (method === 'totp') {
      return { method, challengeRequired: false }
    }

    const mobileDestination = await this.resolveUserOtpDestination(user.id)
    const { challenge, code } = await this.otpService.createChallenge({
      userId: user.id,
      challengeType: 'mfa',
      destination: mobileDestination,
    })

    return {
      method,
      challengeRequired: true,
      challengeId: challenge.id,
      destination: mobileDestination,
      otpCode: process.env.NODE_ENV === 'production' ? undefined : code,
    }
  }

  async get2faFlow(identifier: string) {
    const user = await this.findUserByIdentifier(identifier)
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

  async verify2fa(input: {
    identifier: string
    method: 'sms' | 'totp'
    code: string
    challengeId?: string
    meta: RequestMeta
  }) {
    const user = await this.findUserByIdentifier(input.identifier)
    if (!user) {
      throw new Unauthorized('Invalid 2FA request', 'INVALID_2FA_REQUEST')
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

    return this.completeLogin(user, input.meta)
  }

  async socialGoogleLogin(idToken: string, meta: RequestMeta) {
    const payload = await this.socialAuthService.verifyGoogleIdToken(idToken)

    if (!payload.email || !payload.email_verified) {
      throw new Unauthorized('Google account email is not verified', 'GOOGLE_EMAIL_NOT_VERIFIED')
    }

    const userEmail = await UserEmail.query().where('email', payload.email).first()
    if (!userEmail) {
      throw new Unauthorized('No account linked for this Google email', 'ACCOUNT_NOT_FOUND')
    }

    const user = await User.find(userEmail.userId)
    if (!user) {
      throw new Unauthorized('No account linked for this Google email', 'ACCOUNT_NOT_FOUND')
    }

    const mfaMethods = await this.getEnabled2faMethods(user.id)
    if (mfaMethods.length > 0) {
      return {
        status: 'requires_2fa',
        methods: mfaMethods,
        identifier: payload.email,
      }
    }

    return this.completeLogin(user, meta)
  }

  async checkEmailAvailability(email: string) {
    const existing = await Tenant.query().where('email', email).first()
    return { available: !existing }
  }

  async checkUsernameAvailability(username: string) {
    const existing = await Tenant.query().where('username', username).first()
    return { available: !existing }
  }

  async registerTenant(input: {
    email: string
    password: string
    organizationName: string
    organizationType: string
    username: string
    name: string
    mobileNumber: string
    countryCode?: string
    meta: RequestMeta
  }) {
    const emailExists = await Tenant.query().where('email', input.email).first()
    if (emailExists) {
      throw new BadRequest('Email already exists', 'EMAIL_EXISTS')
    }

    const usernameExists = await Tenant.query().where('username', input.username).first()
    if (usernameExists) {
      throw new BadRequest('Organization username already exists', 'USERNAME_EXISTS')
    }

    const parsedMobile = this.parseInternationalMobile(input.mobileNumber, input.countryCode)

    const user = await db.transaction(async (trx) => {
      const tenant = await Tenant.create(
        {
          name: input.organizationName,
          organizationType: input.organizationType,
          contactName: input.name,
          username: input.username,
          email: input.email,
          mobileNumber: parsedMobile.internationalNumber,
          countryCode: parsedMobile.countryCode,
          status: 'active',
        },
        { client: trx }
      )

      const createdUser = await User.create(
        {
          tenantId: tenant.id,
          userType: 'owner',
          name: input.name,
          status: 'active',
          passwordHash: input.password,
        },
        { client: trx }
      )

      const tenantEmailExists = await UserEmail.query({ client: trx })
        .where('tenant_id', tenant.id)
        .where('email', input.email)
        .first()
      if (tenantEmailExists) {
        throw new BadRequest('Email already exists in this tenant', 'EMAIL_EXISTS')
      }

      const userEmail = await UserEmail.create(
        {
          userId: createdUser.id,
          tenantId: tenant.id,
          email: input.email,
          isPrimary: true,
          isVerified: false,
        },
        { client: trx }
      )

      const userMobile = await UserMobile.create(
        {
          userId: createdUser.id,
          tenantId: tenant.id,
          mobileNumber: parsedMobile.internationalNumber,
          countryCode: parsedMobile.countryCode,
          isPrimary: true,
          isVerified: false,
        },
        { client: trx }
      )

      createdUser.primaryEmailId = userEmail.id
      createdUser.primaryMobileId = userMobile.id
      await createdUser.save()

      return createdUser
    })

    const auth = await this.completeLogin(user, input.meta)
    const verificationToken = await this.authTokenService.issueEmailVerificationToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: input.email,
    })

    // todo: send welcome email
    // send email verification email with verificationToken

    return {
      ...auth,
      emailVerificationSent: true,
      emailVerificationToken: process.env.NODE_ENV === 'production' ? undefined : verificationToken,
    }
  }

  async requestEmailVerification(email: string) {
    const userEmail = await UserEmail.query().where('email', email).first()
    if (!userEmail) {
      return { sent: true }
    }

    if (userEmail.isVerified) {
      return { sent: true }
    }

    const user = await User.find(userEmail.userId)
    if (!user) {
      return { sent: true }
    }

    const token = await this.authTokenService.issueEmailVerificationToken({
      userId: user.id,
      tenantId: user.tenantId,
      email,
    })

    return {
      sent: true,
      verificationToken: process.env.NODE_ENV === 'production' ? undefined : token,
    }
  }

  async confirmEmailVerification(token: string) {
    let payload
    try {
      payload = await this.authTokenService.verifyEmailVerificationToken(token)
    } catch {
      throw new Unauthorized('Invalid email verification token', 'EMAIL_TOKEN_INVALID')
    }

    const userEmail = await UserEmail.query()
      .where('user_id', payload.sub)
      .where('tenant_id', payload.tenant_id)
      .where('email', payload.email)
      .first()

    if (!userEmail) {
      throw new BadRequest('Email record not found', 'EMAIL_NOT_FOUND')
    }

    userEmail.isVerified = true
    userEmail.verifiedAt = DateTime.utc()
    await userEmail.save()

    return { verified: true }
  }

  async logout(sessionId: string) {
    await this.sessionService.revokeSession(sessionId)
    return { loggedOut: true }
  }

  async me(userId: string) {
    const user = await User.find(userId)
    if (!user) {
      throw new Unauthorized('Invalid user context', 'USER_CONTEXT_INVALID')
    }

    return user
  }

  private async completeLogin(user: User, meta: RequestMeta) {
    const session = await this.sessionService.createSession({
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    const accessToken = await this.authTokenService.issueAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      sessionId: session.id,
    })

    user.lastLoginAt = DateTime.utc()
    await user.save()

    return {
      status: 'authenticated',
      accessToken,
      sessionId: session.id,
      tenantId: user.tenantId,
      loginNotificationSent: true, // todo: implement actual notification sending
      user,
    }
  }

  private async findUserByIdentifier(identifier: string) {
    const normalized = identifier.trim()

    if (normalized.includes('@')) {
      const userEmail = await UserEmail.query().where('email', normalized).first()
      if (!userEmail) {
        return null
      }
      return User.find(userEmail.userId)
    }

    const userMobile = await UserMobile.query().where('mobile_number', normalized).first()
    if (!userMobile) {
      return null
    }

    return User.find(userMobile.userId)
  }

  private async resolveUserOtpDestination(userId: string) {
    const primaryMobile = await UserMobile.query()
      .where('user_id', userId)
      .where('is_primary', true)
      .first()

    if (primaryMobile) {
      return primaryMobile.mobileNumber
    }

    const primaryEmail = await UserEmail.query()
      .where('user_id', userId)
      .where('is_primary', true)
      .first()
    if (primaryEmail) {
      return primaryEmail.email
    }

    throw new BadRequest('No destination available for OTP delivery', 'OTP_DESTINATION_MISSING')
  }

  private async getEnabled2faMethods(userId: string) {
    const methods = await MfaMethod.query().where('user_id', userId).where('is_enabled', true)
    return methods
      .map((method) => method.methodType)
      .filter((method): method is 'sms' | 'totp' => method === 'sms' || method === 'totp')
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

  private parseInternationalMobile(rawMobile: string, countryCode?: string) {
    const normalizedCountry = this.normalizeCountryCode(countryCode)
    const parsed =
      parsePhoneNumberFromString(rawMobile, normalizedCountry ?? undefined) ??
      parsePhoneNumberFromString(rawMobile)

    if (!parsed || !parsed.isValid()) {
      throw new BadRequest('Invalid mobile number format', 'INVALID_MOBILE_NUMBER')
    }

    return {
      internationalNumber: parsed.number,
      countryCode: `+${parsed.countryCallingCode}`,
    }
  }

  private normalizeCountryCode(countryCode?: string): CountryCode | null {
    if (!countryCode) {
      return null
    }

    const normalized = countryCode.trim().replace(/^\+/, '').toUpperCase()
    if (/^[A-Z]{2}$/.test(normalized)) {
      return normalized as CountryCode
    }

    return null
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
