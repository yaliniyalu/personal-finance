/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    identifyLoginFlow: typeof routes['auth.identify_login_flow']
    loginWithPassword: typeof routes['auth.login_with_password']
    requestOtpLogin: typeof routes['auth.request_otp_login']
    verifyOtpLogin: typeof routes['auth.verify_otp_login']
    verifyMagicLinkLogin: typeof routes['auth.verify_magic_link_login']
    request2Fa: typeof routes['auth.request_2_fa']
    get2FaFlow: typeof routes['auth.get_2_fa_flow']
    verify2Fa: typeof routes['auth.verify_2_fa']
    socialGoogleLogin: typeof routes['auth.social_google_login']
    registerCheckEmail: typeof routes['auth.register_check_email']
    registerCheckUsername: typeof routes['auth.register_check_username']
    register: typeof routes['auth.register']
    requestEmailVerification: typeof routes['auth.request_email_verification']
    confirmEmailVerification: typeof routes['auth.confirm_email_verification']
    me: typeof routes['auth.me']
    logout: typeof routes['auth.logout']
  }
  passkey: {
    getRegistrationOptions: typeof routes['passkey.get_registration_options']
    verifyRegistration: typeof routes['passkey.verify_registration']
    getLoginOptions: typeof routes['passkey.get_login_options']
    verifyLogin: typeof routes['passkey.verify_login']
  }
  forgetPassword: {
    request: typeof routes['forget_password.request']
    verifyOtp: typeof routes['forget_password.verify_otp']
    verifyMagicLink: typeof routes['forget_password.verify_magic_link']
    get2FaFlow: typeof routes['forget_password.get_2_fa_flow']
    request2Fa: typeof routes['forget_password.request_2_fa']
    verify2Fa: typeof routes['forget_password.verify_2_fa']
    reset: typeof routes['forget_password.reset']
  }
  account: {
    listSessions: typeof routes['account.list_sessions']
    revokeSession: typeof routes['account.revoke_session']
  }
}
