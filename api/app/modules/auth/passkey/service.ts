import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers'
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server'
import Unauthorized from '#exceptions/unauthorized'
import BadRequest from '#exceptions/bad-request'
import User from '#models/user'
import MfaMethod from '#models/mfa-method'
import AuthTokenService from '#services/auth-token-service'
import SessionService from '#services/session-service'

type RequestMeta = {
  ipAddress?: string | null
  userAgent?: string | null
}

@inject()
export default class PasskeyService {
  private readonly rpId = process.env.WEBAUTHN_RP_ID ?? 'localhost'
  private readonly rpName = process.env.WEBAUTHN_RP_NAME ?? 'Billing'
  private readonly origin = process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:3000'

  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly sessionService: SessionService
  ) {}

  async getRegistrationOptions(userId: string, tenantId: string, userName: string) {
    const existingCredentials = await MfaMethod.query()
      .where('user_id', userId)
      .where('method_type', 'passkey')
      .whereNotNull('credential_id')

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpId,
      userID: isoUint8Array.fromUTF8String(userId),
      userName,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
      excludeCredentials: existingCredentials
        .filter((c) => c.credentialId !== null)
        .map((c) => ({ id: c.credentialId! })),
    })

    const challengeToken = await this.authTokenService.issuePasskeyRegisterChallengeToken({
      userId,
      tenantId,
      challenge: options.challenge,
    })

    return { options, challengeToken }
  }

  async verifyRegistration(
    challengeToken: string,
    credential: RegistrationResponseJSON,
    userId: string,
    tenantId: string
  ) {
    let challengePayload
    try {
      challengePayload = await this.authTokenService.verifyPasskeyRegisterChallengeToken(
        challengeToken
      )
    } catch {
      throw new Unauthorized('Invalid or expired passkey challenge', 'PASSKEY_CHALLENGE_INVALID')
    }

    if (challengePayload.sub !== userId || challengePayload.tenant_id !== tenantId) {
      throw new Unauthorized('Passkey challenge does not match authenticated user', 'PASSKEY_CHALLENGE_MISMATCH')
    }

    let verification
    try {
      verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: challengePayload.challenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpId,
      })
    } catch {
      throw new BadRequest('Passkey registration verification failed', 'PASSKEY_REGISTRATION_FAILED')
    }

    if (!verification.verified || !verification.registrationInfo) {
      throw new BadRequest('Passkey registration was not verified', 'PASSKEY_NOT_VERIFIED')
    }

    const { credential: webAuthnCredential, aaguid } = verification.registrationInfo

    const mfaMethod = await MfaMethod.create({
      userId,
      methodType: 'passkey',
      isEnabled: true,
      isPrimary: false,
      credentialId: webAuthnCredential.id,
      publicKey: isoBase64URL.fromBuffer(webAuthnCredential.publicKey),
      counter: webAuthnCredential.counter,
      aaguid: aaguid ?? null,
      transports: JSON.stringify(webAuthnCredential.transports ?? []),
    })

    return { passkeyId: mfaMethod.id }
  }

  async getLoginOptions() {
    const options = await generateAuthenticationOptions({
      rpID: this.rpId,
      userVerification: 'required',
      allowCredentials: [],
    })

    const challengeToken = await this.authTokenService.issuePasskeyLoginChallengeToken({
      challenge: options.challenge,
    })

    return { options, challengeToken }
  }

  async verifyLogin(
    challengeToken: string,
    credential: AuthenticationResponseJSON,
    meta: RequestMeta
  ) {
    let challengePayload
    try {
      challengePayload = await this.authTokenService.verifyPasskeyLoginChallengeToken(challengeToken)
    } catch {
      throw new Unauthorized('Invalid or expired passkey challenge', 'PASSKEY_CHALLENGE_INVALID')
    }

    const mfaMethod = await MfaMethod.query()
      .where('credential_id', credential.id)
      .where('method_type', 'passkey')
      .where('is_enabled', true)
      .first()

    if (!mfaMethod || !mfaMethod.publicKey || mfaMethod.counter === null) {
      throw new Unauthorized('Passkey not found or disabled', 'PASSKEY_NOT_FOUND')
    }

    const user = await User.find(mfaMethod.userId)
    if (!user) {
      throw new Unauthorized('User not found', 'USER_NOT_FOUND')
    }

    const storedTransports: AuthenticatorTransportFuture[] = mfaMethod.transports
      ? JSON.parse(mfaMethod.transports)
      : []

    let verification
    try {
      verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: challengePayload.challenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpId,
        credential: {
          id: mfaMethod.credentialId!,
          publicKey: isoBase64URL.toBuffer(mfaMethod.publicKey),
          counter: mfaMethod.counter,
          transports: storedTransports,
        },
      })
    } catch {
      throw new Unauthorized('Passkey authentication failed', 'PASSKEY_AUTH_FAILED')
    }

    if (!verification.verified) {
      throw new Unauthorized('Passkey authentication was not verified', 'PASSKEY_NOT_VERIFIED')
    }

    mfaMethod.counter = verification.authenticationInfo.newCounter
    mfaMethod.lastUsedAt = DateTime.utc()
    await mfaMethod.save()

    return this.completeLogin(user, meta)
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
      loginNotificationSent: true,
      user,
    }
  }
}
