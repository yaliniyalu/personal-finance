import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Unauthorized from '#exceptions/unauthorized'
import Response from '#helpers/response'
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/server'
import PasskeyService from './service.js'
import { passkeyRegisterVerifyValidator, passkeyLoginVerifyValidator } from './validators.js'

@inject()
export default class PasskeyController {
  constructor(private readonly passkeyService: PasskeyService) {}

  public async getRegistrationOptions(ctx: HttpContext) {
    const authUser = ctx.authUser
    if (!authUser) {
      throw new Unauthorized('Authentication required', 'UNAUTHORIZED')
    }

    const userName = authUser.name ?? authUser.id
    const result = await this.passkeyService.getRegistrationOptions(
      authUser.id,
      authUser.tenantId,
      userName
    )
    return Response.success(result)
  }

  public async verifyRegistration(ctx: HttpContext) {
    const authUser = ctx.authUser
    if (!authUser) {
      throw new Unauthorized('Authentication required', 'UNAUTHORIZED')
    }

    const data = await ctx.request.validateUsing(passkeyRegisterVerifyValidator)
    const result = await this.passkeyService.verifyRegistration(
      data.challengeToken,
      data.credential as unknown as RegistrationResponseJSON,
      authUser.id,
      authUser.tenantId
    )
    return Response.success(result)
  }

  public async getLoginOptions(_ctx: HttpContext) {
    const result = await this.passkeyService.getLoginOptions()
    return Response.success(result)
  }

  public async verifyLogin(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(passkeyLoginVerifyValidator)
    const result = await this.passkeyService.verifyLogin(
      data.challengeToken,
      data.credential as unknown as AuthenticationResponseJSON,
      {
        ipAddress: ctx.request.ip(),
        userAgent: ctx.request.header('user-agent'),
      }
    )
    return Response.success(result)
  }
}
