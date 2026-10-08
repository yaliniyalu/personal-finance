import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Unauthorized from '#exceptions/unauthorized'
import Response from '#helpers/response'
import Service from './service.js'
import {
  login2faRequestValidator,
  login2faFlowValidator,
  login2faVerifyValidator,
  loginIdentifierValidator,
  loginMagicLinkVerifyValidator,
  loginOtpRequestValidator,
  loginOtpVerifyValidator,
  loginPasswordValidator,
  registerCheckEmailValidator,
  registerCheckUsernameValidator,
  registerValidator,
  socialGoogleLoginValidator,
  verifyEmailConfirmValidator,
  verifyEmailRequestValidator,
} from './validators.js'

@inject()
export default class Controller {
  constructor(private readonly authService: Service) {}

  public async identifyLoginFlow(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(loginIdentifierValidator)
    const result = await this.authService.identifyLoginFlow(data.identifier)
    return Response.success(result)
  }

  public async loginWithPassword(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(loginPasswordValidator)
    const result = await this.authService.loginWithPassword(data.identifier, data.password, {
      ipAddress: ctx.request.ip(),
      userAgent: ctx.request.header('user-agent'),
    })
    return Response.success(result)
  }

  public async requestOtpLogin(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(loginOtpRequestValidator)
    const result = await this.authService.requestOtpLogin(data.identifier)
    return Response.success(result)
  }

  public async verifyOtpLogin(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(loginOtpVerifyValidator)
    const result = await this.authService.verifyOtpLogin(data.challengeId, data.code, {
      ipAddress: ctx.request.ip(),
      userAgent: ctx.request.header('user-agent'),
    })
    return Response.success(result)
  }

  public async verifyMagicLinkLogin(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(loginMagicLinkVerifyValidator)
    const result = await this.authService.verifyMagicLinkLogin(data.token, {
      ipAddress: ctx.request.ip(),
      userAgent: ctx.request.header('user-agent'),
    })
    return Response.success(result)
  }

  public async request2fa(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(login2faRequestValidator)
    const result = await this.authService.request2fa(data.identifier, data.method)
    return Response.success(result)
  }

  public async get2faFlow(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(login2faFlowValidator)
    const result = await this.authService.get2faFlow(data.identifier)
    return Response.success(result)
  }

  public async verify2fa(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(login2faVerifyValidator)
    const result = await this.authService.verify2fa({
      identifier: data.identifier,
      method: data.method,
      code: data.code,
      challengeId: data.challengeId,
      meta: {
        ipAddress: ctx.request.ip(),
        userAgent: ctx.request.header('user-agent'),
      },
    })
    return Response.success(result)
  }

  public async socialGoogleLogin(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(socialGoogleLoginValidator)
    const result = await this.authService.socialGoogleLogin(data.idToken, {
      ipAddress: ctx.request.ip(),
      userAgent: ctx.request.header('user-agent'),
    })
    return Response.success(result)
  }

  public async registerCheckEmail(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(registerCheckEmailValidator)
    const result = await this.authService.checkEmailAvailability(data.email)
    return Response.success(result)
  }

  public async registerCheckUsername(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(registerCheckUsernameValidator)
    const result = await this.authService.checkUsernameAvailability(data.username)
    return Response.success(result)
  }

  public async register(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(registerValidator)
    const result = await this.authService.registerTenant({
      ...data,
      meta: {
        ipAddress: ctx.request.ip(),
        userAgent: ctx.request.header('user-agent'),
      },
    })
    return Response.success(result)
  }

  public async requestEmailVerification(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(verifyEmailRequestValidator)
    const result = await this.authService.requestEmailVerification(data.email)
    return Response.success(result)
  }

  public async confirmEmailVerification(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(verifyEmailConfirmValidator)
    const result = await this.authService.confirmEmailVerification(data.token)
    return Response.success(result)
  }

  public async me(ctx: HttpContext) {
    if (!ctx.authUser) {
      throw new Unauthorized('Unauthorized', 'UNAUTHORIZED')
    }

    const result = await this.authService.me(ctx.authUser.id)
    return Response.success(result)
  }

  public async logout(ctx: HttpContext) {
    if (!ctx.authSession) {
      throw new Unauthorized('Unauthorized', 'UNAUTHORIZED')
    }

    const result = await this.authService.logout(ctx.authSession.id)
    return Response.success(result)
  }
}
