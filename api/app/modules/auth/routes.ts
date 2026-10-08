import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import forgetPasswordRoutes from './forget-password/routes.js'
import passkeyRoutes from './passkey/routes.js'

const AuthController = () => import('./controller.js')

export default () => {
  router
    .group(() => {
      router.post('/login/identifier', [AuthController, 'identifyLoginFlow'])
      router.post('/login/password', [AuthController, 'loginWithPassword'])
      router.post('/login/otp/request', [AuthController, 'requestOtpLogin'])
      router.post('/login/otp/verify', [AuthController, 'verifyOtpLogin'])
      router.post('/login/magic-link/verify', [AuthController, 'verifyMagicLinkLogin'])
      router.post('/login/2fa/request', [AuthController, 'request2fa'])
      router.post('/login/2fa/flow', [AuthController, 'get2faFlow'])
      router.post('/login/2fa/verify', [AuthController, 'verify2fa'])

      router.post('/social/google', [AuthController, 'socialGoogleLogin'])

      router.post('/register/check-email', [AuthController, 'registerCheckEmail'])
      router.post('/register/check-username', [AuthController, 'registerCheckUsername'])
      router.post('/register', [AuthController, 'register'])
      router.post('/register/verify-email/request', [AuthController, 'requestEmailVerification'])
      router.post('/register/verify-email/confirm', [AuthController, 'confirmEmailVerification'])

      router.get('/me', [AuthController, 'me']).use(middleware.jwtAuth())
      router.post('/logout', [AuthController, 'logout']).use(middleware.jwtAuth())

      passkeyRoutes()
      forgetPasswordRoutes()
    })
    .prefix('auth')
}
