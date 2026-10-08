import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const PasskeyController = () => import('./controller.js')

export default () => {
  router
    .group(() => {
      router
        .post('/register/options', [PasskeyController, 'getRegistrationOptions'])
        .use(middleware.jwtAuth())
      router
        .post('/register/verify', [PasskeyController, 'verifyRegistration'])
        .use(middleware.jwtAuth())
      router.post('/login/options', [PasskeyController, 'getLoginOptions'])
      router.post('/login/verify', [PasskeyController, 'verifyLogin'])
    })
    .prefix('passkey')
}
