import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.identify_login_flow': { paramsTuple?: []; params?: {} }
    'auth.login_with_password': { paramsTuple?: []; params?: {} }
    'auth.request_otp_login': { paramsTuple?: []; params?: {} }
    'auth.verify_otp_login': { paramsTuple?: []; params?: {} }
    'auth.verify_magic_link_login': { paramsTuple?: []; params?: {} }
    'auth.request_2_fa': { paramsTuple?: []; params?: {} }
    'auth.get_2_fa_flow': { paramsTuple?: []; params?: {} }
    'auth.verify_2_fa': { paramsTuple?: []; params?: {} }
    'auth.social_google_login': { paramsTuple?: []; params?: {} }
    'auth.register_check_email': { paramsTuple?: []; params?: {} }
    'auth.register_check_username': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.request_email_verification': { paramsTuple?: []; params?: {} }
    'auth.confirm_email_verification': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'passkey.get_registration_options': { paramsTuple?: []; params?: {} }
    'passkey.verify_registration': { paramsTuple?: []; params?: {} }
    'passkey.get_login_options': { paramsTuple?: []; params?: {} }
    'passkey.verify_login': { paramsTuple?: []; params?: {} }
    'forget_password.request': { paramsTuple?: []; params?: {} }
    'forget_password.verify_otp': { paramsTuple?: []; params?: {} }
    'forget_password.verify_magic_link': { paramsTuple?: []; params?: {} }
    'forget_password.get_2_fa_flow': { paramsTuple?: []; params?: {} }
    'forget_password.request_2_fa': { paramsTuple?: []; params?: {} }
    'forget_password.verify_2_fa': { paramsTuple?: []; params?: {} }
    'forget_password.reset': { paramsTuple?: []; params?: {} }
    'account.list_sessions': { paramsTuple?: []; params?: {} }
    'account.revoke_session': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
  }
  POST: {
    'auth.identify_login_flow': { paramsTuple?: []; params?: {} }
    'auth.login_with_password': { paramsTuple?: []; params?: {} }
    'auth.request_otp_login': { paramsTuple?: []; params?: {} }
    'auth.verify_otp_login': { paramsTuple?: []; params?: {} }
    'auth.verify_magic_link_login': { paramsTuple?: []; params?: {} }
    'auth.request_2_fa': { paramsTuple?: []; params?: {} }
    'auth.get_2_fa_flow': { paramsTuple?: []; params?: {} }
    'auth.verify_2_fa': { paramsTuple?: []; params?: {} }
    'auth.social_google_login': { paramsTuple?: []; params?: {} }
    'auth.register_check_email': { paramsTuple?: []; params?: {} }
    'auth.register_check_username': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.request_email_verification': { paramsTuple?: []; params?: {} }
    'auth.confirm_email_verification': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'passkey.get_registration_options': { paramsTuple?: []; params?: {} }
    'passkey.verify_registration': { paramsTuple?: []; params?: {} }
    'passkey.get_login_options': { paramsTuple?: []; params?: {} }
    'passkey.verify_login': { paramsTuple?: []; params?: {} }
    'forget_password.request': { paramsTuple?: []; params?: {} }
    'forget_password.verify_otp': { paramsTuple?: []; params?: {} }
    'forget_password.verify_magic_link': { paramsTuple?: []; params?: {} }
    'forget_password.get_2_fa_flow': { paramsTuple?: []; params?: {} }
    'forget_password.request_2_fa': { paramsTuple?: []; params?: {} }
    'forget_password.verify_2_fa': { paramsTuple?: []; params?: {} }
    'forget_password.reset': { paramsTuple?: []; params?: {} }
    'account.revoke_session': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
  }
  GET: {
    'auth.me': { paramsTuple?: []; params?: {} }
    'account.list_sessions': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'auth.me': { paramsTuple?: []; params?: {} }
    'account.list_sessions': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}