import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Response from '#helpers/response'
import ForgetPasswordService from './service.js'
import {
  forgetPassword2faFlowValidator,
  forgetPassword2faRequestValidator,
  forgetPassword2faVerifyValidator,
  forgetPasswordRequestValidator,
  forgetPasswordResetValidator,
  forgetPasswordVerifyMagicLinkValidator,
  forgetPasswordVerifyOtpValidator,
} from './validators.js'

@inject()
export default class ForgetPasswordController {
  constructor(private readonly forgetPasswordService: ForgetPasswordService) {}

  public async request(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(forgetPasswordRequestValidator)
    const result = await this.forgetPasswordService.request(data.email)
    return Response.success(result)
  }

  public async verifyOtp(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(forgetPasswordVerifyOtpValidator)
    const result = await this.forgetPasswordService.verifyOtp(data.challengeId, data.code)
    return Response.success(result)
  }

  public async verifyMagicLink(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(forgetPasswordVerifyMagicLinkValidator)
    const result = await this.forgetPasswordService.verifyMagicLink(data.token)
    return Response.success(result)
  }

  public async get2faFlow(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(forgetPassword2faFlowValidator)
    const result = await this.forgetPasswordService.get2faFlow(data.email)
    return Response.success(result)
  }

  public async request2fa(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(forgetPassword2faRequestValidator)
    const result = await this.forgetPasswordService.request2fa(data.challengeToken, data.method)
    return Response.success(result)
  }

  public async verify2fa(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(forgetPassword2faVerifyValidator)
    const result = await this.forgetPasswordService.verify2fa({
      challengeToken: data.challengeToken,
      method: data.method,
      code: data.code,
      challengeId: data.challengeId,
    })
    return Response.success(result)
  }

  public async reset(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(forgetPasswordResetValidator)
    const result = await this.forgetPasswordService.resetPassword(data.resetToken, data.newPassword)
    return Response.success(result)
  }
}
