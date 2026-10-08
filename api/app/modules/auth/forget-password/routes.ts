import router from '@adonisjs/core/services/router'

const ForgetPasswordController = () => import('./controller.js')

export default () => {
  router
    .group(() => {
      router.post('/request', [ForgetPasswordController, 'request'])
      router.post('/verify-otp', [ForgetPasswordController, 'verifyOtp'])
      router.post('/verify-magic-link', [ForgetPasswordController, 'verifyMagicLink'])
      router.post('/2fa/flow', [ForgetPasswordController, 'get2faFlow'])
      router.post('/2fa/request', [ForgetPasswordController, 'request2fa'])
      router.post('/2fa/verify', [ForgetPasswordController, 'verify2fa'])
      router.post('/reset', [ForgetPasswordController, 'reset'])
    })
    .prefix('forget-password')
}
