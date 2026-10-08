import { createRemoteJWKSet, jwtVerify } from 'jose'
import { inject } from '@adonisjs/core'

type GoogleIdTokenPayload = {
  sub: string
  email?: string
  email_verified?: boolean
  name?: string
  picture?: string
}

@inject()
export default class SocialAuthService {
  private readonly googleAudience = process.env.GOOGLE_CLIENT_ID
  private readonly googleJwks = createRemoteJWKSet(
    new URL('https://www.googleapis.com/oauth2/v3/certs')
  )

  async verifyGoogleIdToken(idToken: string): Promise<GoogleIdTokenPayload> {
    if (!this.googleAudience) {
      throw new Error('Google auth is not configured')
    }

    const { payload } = await jwtVerify(idToken, this.googleJwks, {
      issuer: ['accounts.google.com', 'https://accounts.google.com'],
      audience: this.googleAudience,
    })

    return {
      sub: String(payload.sub),
      email: payload.email ? String(payload.email) : undefined,
      email_verified: Boolean(payload.email_verified),
      name: payload.name ? String(payload.name) : undefined,
      picture: payload.picture ? String(payload.picture) : undefined,
    }
  }
}
