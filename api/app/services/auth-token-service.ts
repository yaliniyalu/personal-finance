import { randomBytes } from 'node:crypto'
import { inject } from '@adonisjs/core'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export type AccessTokenPayload = JWTPayload & {
  sub: string
  tenant_id: string
  session_id: string
  token_type: 'access'
}

export type EmailVerificationPayload = JWTPayload & {
  sub: string
  tenant_id: string
  token_type: 'email_verification'
  email: string
}

export type MagicLinkPayload = JWTPayload & {
  sub: string
  tenant_id: string
  token_type: 'magic_link'
}

export type PasswordResetMagicLinkPayload = JWTPayload & {
  sub: string
  tenant_id: string
  token_type: 'password_reset_magic_link'
  email: string
}

export type PasswordResetChallengePayload = JWTPayload & {
  sub: string
  tenant_id: string
  token_type: 'password_reset_challenge'
}

export type PasswordResetPayload = JWTPayload & {
  sub: string
  tenant_id: string
  token_type: 'password_reset'
}

export type PasskeyRegisterChallengePayload = JWTPayload & {
  sub: string
  tenant_id: string
  token_type: 'passkey_register_challenge'
  challenge: string
}

export type PasskeyLoginChallengePayload = JWTPayload & {
  sub: 'passkey_login'
  token_type: 'passkey_login_challenge'
  challenge: string
}

@inject()
export default class AuthTokenService {
  private readonly issuer = process.env.JWT_ISSUER ?? 'billing-api'
  private readonly audience = process.env.JWT_AUDIENCE ?? 'billing-web-admin'
  private readonly jwtSecret =
    process.env.JWT_SECRET ?? process.env.APP_KEY ?? randomBytes(32).toString('hex')
  private readonly accessTokenTtl = process.env.JWT_ACCESS_TTL ?? '1h'
  private readonly magicLinkTtl = process.env.MAGIC_LINK_TTL ?? '15m'
  private readonly emailVerificationTtl = process.env.EMAIL_VERIFICATION_TTL ?? '24h'
  private readonly passwordResetMagicLinkTtl =
    process.env.PASSWORD_RESET_MAGIC_LINK_TTL ?? process.env.MAGIC_LINK_TTL ?? '15m'
  private readonly passwordResetChallengeTtl = process.env.PASSWORD_RESET_CHALLENGE_TTL ?? '10m'
  private readonly passwordResetTokenTtl = process.env.PASSWORD_RESET_TOKEN_TTL ?? '30m'
  private readonly passkeyChallengeTtl = process.env.PASSKEY_CHALLENGE_TTL ?? '5m'

  private get secretKey() {
    return new TextEncoder().encode(this.jwtSecret)
  }

  async issueAccessToken(input: { userId: string; tenantId: string; sessionId: string }) {
    return new SignJWT({
      tenant_id: input.tenantId,
      session_id: input.sessionId,
      token_type: 'access',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(input.userId)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(this.accessTokenTtl)
      .sign(this.secretKey)
  }

  async verifyAccessToken(token: string) {
    const { payload } = await jwtVerify(token, this.secretKey, {
      issuer: this.issuer,
      audience: this.audience,
    })

    if (
      payload.token_type !== 'access' ||
      !payload.sub ||
      !payload.tenant_id ||
      !payload.session_id
    ) {
      throw new Error('Invalid access token payload')
    }

    return payload as AccessTokenPayload
  }

  async issueMagicLinkToken(input: { userId: string; tenantId: string }) {
    return new SignJWT({
      tenant_id: input.tenantId,
      token_type: 'magic_link',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(input.userId)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(this.magicLinkTtl)
      .sign(this.secretKey)
  }

  async verifyMagicLinkToken(token: string) {
    const { payload } = await jwtVerify(token, this.secretKey, {
      issuer: this.issuer,
      audience: this.audience,
    })

    if (payload.token_type !== 'magic_link' || !payload.sub || !payload.tenant_id) {
      throw new Error('Invalid magic link token payload')
    }

    return payload as MagicLinkPayload
  }

  async issueEmailVerificationToken(input: { userId: string; tenantId: string; email: string }) {
    return new SignJWT({
      tenant_id: input.tenantId,
      token_type: 'email_verification',
      email: input.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(input.userId)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(this.emailVerificationTtl)
      .sign(this.secretKey)
  }

  async verifyEmailVerificationToken(token: string) {
    const { payload } = await jwtVerify(token, this.secretKey, {
      issuer: this.issuer,
      audience: this.audience,
    })

    if (payload.token_type !== 'email_verification' || !payload.sub || !payload.tenant_id) {
      throw new Error('Invalid email verification token payload')
    }

    return payload as EmailVerificationPayload
  }

  async issuePasswordResetMagicLinkToken(input: { userId: string; tenantId: string; email: string }) {
    return new SignJWT({
      tenant_id: input.tenantId,
      token_type: 'password_reset_magic_link',
      email: input.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(input.userId)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(this.passwordResetMagicLinkTtl)
      .sign(this.secretKey)
  }

  async verifyPasswordResetMagicLinkToken(token: string) {
    const { payload } = await jwtVerify(token, this.secretKey, {
      issuer: this.issuer,
      audience: this.audience,
    })

    if (
      payload.token_type !== 'password_reset_magic_link' ||
      !payload.sub ||
      !payload.tenant_id ||
      !payload.email
    ) {
      throw new Error('Invalid password reset magic link token payload')
    }

    return payload as PasswordResetMagicLinkPayload
  }

  async issuePasswordResetChallengeToken(input: { userId: string; tenantId: string }) {
    return new SignJWT({
      tenant_id: input.tenantId,
      token_type: 'password_reset_challenge',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(input.userId)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(this.passwordResetChallengeTtl)
      .sign(this.secretKey)
  }

  async verifyPasswordResetChallengeToken(token: string) {
    const { payload } = await jwtVerify(token, this.secretKey, {
      issuer: this.issuer,
      audience: this.audience,
    })

    if (payload.token_type !== 'password_reset_challenge' || !payload.sub || !payload.tenant_id) {
      throw new Error('Invalid password reset challenge token payload')
    }

    return payload as PasswordResetChallengePayload
  }

  async issuePasswordResetToken(input: { userId: string; tenantId: string }) {
    return new SignJWT({
      tenant_id: input.tenantId,
      token_type: 'password_reset',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(input.userId)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(this.passwordResetTokenTtl)
      .sign(this.secretKey)
  }

  async verifyPasswordResetToken(token: string) {
    const { payload } = await jwtVerify(token, this.secretKey, {
      issuer: this.issuer,
      audience: this.audience,
    })

    if (payload.token_type !== 'password_reset' || !payload.sub || !payload.tenant_id) {
      throw new Error('Invalid password reset token payload')
    }

    return payload as PasswordResetPayload
  }

  async issuePasskeyRegisterChallengeToken(input: {
    userId: string
    tenantId: string
    challenge: string
  }) {
    return new SignJWT({
      tenant_id: input.tenantId,
      token_type: 'passkey_register_challenge',
      challenge: input.challenge,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(input.userId)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(this.passkeyChallengeTtl)
      .sign(this.secretKey)
  }

  async verifyPasskeyRegisterChallengeToken(token: string) {
    const { payload } = await jwtVerify(token, this.secretKey, {
      issuer: this.issuer,
      audience: this.audience,
    })

    if (
      payload.token_type !== 'passkey_register_challenge' ||
      !payload.sub ||
      !payload.tenant_id ||
      !payload.challenge
    ) {
      throw new Error('Invalid passkey register challenge token payload')
    }

    return payload as PasskeyRegisterChallengePayload
  }

  async issuePasskeyLoginChallengeToken(input: { challenge: string }) {
    return new SignJWT({
      token_type: 'passkey_login_challenge',
      challenge: input.challenge,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('passkey_login')
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime(this.passkeyChallengeTtl)
      .sign(this.secretKey)
  }

  async verifyPasskeyLoginChallengeToken(token: string) {
    const { payload } = await jwtVerify(token, this.secretKey, {
      issuer: this.issuer,
      audience: this.audience,
    })

    if (
      payload.token_type !== 'passkey_login_challenge' ||
      payload.sub !== 'passkey_login' ||
      !payload.challenge
    ) {
      throw new Error('Invalid passkey login challenge token payload')
    }

    return payload as PasskeyLoginChallengePayload
  }
}
