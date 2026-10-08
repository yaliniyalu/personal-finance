import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Unauthorized from '#exceptions/unauthorized'
import Response from '#helpers/response'
import AccountService from './service.js'
import { revokeSessionParamsValidator } from './validators.js'

@inject()
export default class AccountController {
  constructor(private readonly accountService: AccountService) {}

  public async listSessions(ctx: HttpContext) {
    if (!ctx.authUser || !ctx.authSession) {
      throw new Unauthorized('Unauthorized', 'UNAUTHORIZED')
    }

    const sessions = await this.accountService.listSessions(ctx.authUser.id, ctx.authSession.id)
    return Response.success({ sessions })
  }

  public async revokeSession(ctx: HttpContext) {
    if (!ctx.authUser || !ctx.authSession) {
      throw new Unauthorized('Unauthorized', 'UNAUTHORIZED')
    }

    const params = await ctx.request.validateUsing(revokeSessionParamsValidator, {
      data: ctx.request.params(),
    })

    const result = await this.accountService.revokeSession(
      ctx.authUser.id,
      ctx.authSession.id,
      params.sessionId
    )

    return Response.success(result)
  }
}
