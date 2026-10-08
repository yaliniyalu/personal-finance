import router from '@adonisjs/core/services/router'
import authRouter from '#modules/auth/routes'
import accountRoutes from '#modules/tenant/account/routes'

export default () => {
  router
    .group(async () => {
      authRouter()
      accountRoutes()
    })
    .prefix('api/v1')
}