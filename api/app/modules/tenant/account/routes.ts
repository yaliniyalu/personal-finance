import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AccountController = () => import('./controller.js')

export default () => {
  router
    .group(() => {
      router.get('/sessions', [AccountController, 'listSessions']).use(middleware.jwtAuth())
      router
        .post('/sessions/:sessionId/revoke', [AccountController, 'revokeSession'])
        .use(middleware.jwtAuth())
    })
    .prefix('account')
}
