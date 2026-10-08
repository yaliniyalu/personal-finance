/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.identify_login_flow': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login/identifier',
    tokens: [{"old":"/api/v1/auth/login/identifier","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login/identifier","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login/identifier","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login/identifier","type":0,"val":"login","end":""},{"old":"/api/v1/auth/login/identifier","type":0,"val":"identifier","end":""}],
    types: placeholder as Registry['auth.identify_login_flow']['types'],
  },
  'auth.login_with_password': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login/password',
    tokens: [{"old":"/api/v1/auth/login/password","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login/password","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login/password","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login/password","type":0,"val":"login","end":""},{"old":"/api/v1/auth/login/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['auth.login_with_password']['types'],
  },
  'auth.request_otp_login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login/otp/request',
    tokens: [{"old":"/api/v1/auth/login/otp/request","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login/otp/request","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login/otp/request","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login/otp/request","type":0,"val":"login","end":""},{"old":"/api/v1/auth/login/otp/request","type":0,"val":"otp","end":""},{"old":"/api/v1/auth/login/otp/request","type":0,"val":"request","end":""}],
    types: placeholder as Registry['auth.request_otp_login']['types'],
  },
  'auth.verify_otp_login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login/otp/verify',
    tokens: [{"old":"/api/v1/auth/login/otp/verify","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login/otp/verify","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login/otp/verify","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login/otp/verify","type":0,"val":"login","end":""},{"old":"/api/v1/auth/login/otp/verify","type":0,"val":"otp","end":""},{"old":"/api/v1/auth/login/otp/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['auth.verify_otp_login']['types'],
  },
  'auth.verify_magic_link_login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login/magic-link/verify',
    tokens: [{"old":"/api/v1/auth/login/magic-link/verify","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login/magic-link/verify","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login/magic-link/verify","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login/magic-link/verify","type":0,"val":"login","end":""},{"old":"/api/v1/auth/login/magic-link/verify","type":0,"val":"magic-link","end":""},{"old":"/api/v1/auth/login/magic-link/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['auth.verify_magic_link_login']['types'],
  },
  'auth.request_2_fa': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login/2fa/request',
    tokens: [{"old":"/api/v1/auth/login/2fa/request","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login/2fa/request","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login/2fa/request","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login/2fa/request","type":0,"val":"login","end":""},{"old":"/api/v1/auth/login/2fa/request","type":0,"val":"2fa","end":""},{"old":"/api/v1/auth/login/2fa/request","type":0,"val":"request","end":""}],
    types: placeholder as Registry['auth.request_2_fa']['types'],
  },
  'auth.get_2_fa_flow': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login/2fa/flow',
    tokens: [{"old":"/api/v1/auth/login/2fa/flow","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login/2fa/flow","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login/2fa/flow","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login/2fa/flow","type":0,"val":"login","end":""},{"old":"/api/v1/auth/login/2fa/flow","type":0,"val":"2fa","end":""},{"old":"/api/v1/auth/login/2fa/flow","type":0,"val":"flow","end":""}],
    types: placeholder as Registry['auth.get_2_fa_flow']['types'],
  },
  'auth.verify_2_fa': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login/2fa/verify',
    tokens: [{"old":"/api/v1/auth/login/2fa/verify","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login/2fa/verify","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login/2fa/verify","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login/2fa/verify","type":0,"val":"login","end":""},{"old":"/api/v1/auth/login/2fa/verify","type":0,"val":"2fa","end":""},{"old":"/api/v1/auth/login/2fa/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['auth.verify_2_fa']['types'],
  },
  'auth.social_google_login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/social/google',
    tokens: [{"old":"/api/v1/auth/social/google","type":0,"val":"api","end":""},{"old":"/api/v1/auth/social/google","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/social/google","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/social/google","type":0,"val":"social","end":""},{"old":"/api/v1/auth/social/google","type":0,"val":"google","end":""}],
    types: placeholder as Registry['auth.social_google_login']['types'],
  },
  'auth.register_check_email': {
    methods: ["POST"],
    pattern: '/api/v1/auth/register/check-email',
    tokens: [{"old":"/api/v1/auth/register/check-email","type":0,"val":"api","end":""},{"old":"/api/v1/auth/register/check-email","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/register/check-email","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/register/check-email","type":0,"val":"register","end":""},{"old":"/api/v1/auth/register/check-email","type":0,"val":"check-email","end":""}],
    types: placeholder as Registry['auth.register_check_email']['types'],
  },
  'auth.register_check_username': {
    methods: ["POST"],
    pattern: '/api/v1/auth/register/check-username',
    tokens: [{"old":"/api/v1/auth/register/check-username","type":0,"val":"api","end":""},{"old":"/api/v1/auth/register/check-username","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/register/check-username","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/register/check-username","type":0,"val":"register","end":""},{"old":"/api/v1/auth/register/check-username","type":0,"val":"check-username","end":""}],
    types: placeholder as Registry['auth.register_check_username']['types'],
  },
  'auth.register': {
    methods: ["POST"],
    pattern: '/api/v1/auth/register',
    tokens: [{"old":"/api/v1/auth/register","type":0,"val":"api","end":""},{"old":"/api/v1/auth/register","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/register","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register']['types'],
  },
  'auth.request_email_verification': {
    methods: ["POST"],
    pattern: '/api/v1/auth/register/verify-email/request',
    tokens: [{"old":"/api/v1/auth/register/verify-email/request","type":0,"val":"api","end":""},{"old":"/api/v1/auth/register/verify-email/request","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/register/verify-email/request","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/register/verify-email/request","type":0,"val":"register","end":""},{"old":"/api/v1/auth/register/verify-email/request","type":0,"val":"verify-email","end":""},{"old":"/api/v1/auth/register/verify-email/request","type":0,"val":"request","end":""}],
    types: placeholder as Registry['auth.request_email_verification']['types'],
  },
  'auth.confirm_email_verification': {
    methods: ["POST"],
    pattern: '/api/v1/auth/register/verify-email/confirm',
    tokens: [{"old":"/api/v1/auth/register/verify-email/confirm","type":0,"val":"api","end":""},{"old":"/api/v1/auth/register/verify-email/confirm","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/register/verify-email/confirm","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/register/verify-email/confirm","type":0,"val":"register","end":""},{"old":"/api/v1/auth/register/verify-email/confirm","type":0,"val":"verify-email","end":""},{"old":"/api/v1/auth/register/verify-email/confirm","type":0,"val":"confirm","end":""}],
    types: placeholder as Registry['auth.confirm_email_verification']['types'],
  },
  'auth.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/me',
    tokens: [{"old":"/api/v1/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['auth.me']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'passkey.get_registration_options': {
    methods: ["POST"],
    pattern: '/api/v1/auth/passkey/register/options',
    tokens: [{"old":"/api/v1/auth/passkey/register/options","type":0,"val":"api","end":""},{"old":"/api/v1/auth/passkey/register/options","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/passkey/register/options","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/passkey/register/options","type":0,"val":"passkey","end":""},{"old":"/api/v1/auth/passkey/register/options","type":0,"val":"register","end":""},{"old":"/api/v1/auth/passkey/register/options","type":0,"val":"options","end":""}],
    types: placeholder as Registry['passkey.get_registration_options']['types'],
  },
  'passkey.verify_registration': {
    methods: ["POST"],
    pattern: '/api/v1/auth/passkey/register/verify',
    tokens: [{"old":"/api/v1/auth/passkey/register/verify","type":0,"val":"api","end":""},{"old":"/api/v1/auth/passkey/register/verify","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/passkey/register/verify","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/passkey/register/verify","type":0,"val":"passkey","end":""},{"old":"/api/v1/auth/passkey/register/verify","type":0,"val":"register","end":""},{"old":"/api/v1/auth/passkey/register/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['passkey.verify_registration']['types'],
  },
  'passkey.get_login_options': {
    methods: ["POST"],
    pattern: '/api/v1/auth/passkey/login/options',
    tokens: [{"old":"/api/v1/auth/passkey/login/options","type":0,"val":"api","end":""},{"old":"/api/v1/auth/passkey/login/options","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/passkey/login/options","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/passkey/login/options","type":0,"val":"passkey","end":""},{"old":"/api/v1/auth/passkey/login/options","type":0,"val":"login","end":""},{"old":"/api/v1/auth/passkey/login/options","type":0,"val":"options","end":""}],
    types: placeholder as Registry['passkey.get_login_options']['types'],
  },
  'passkey.verify_login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/passkey/login/verify',
    tokens: [{"old":"/api/v1/auth/passkey/login/verify","type":0,"val":"api","end":""},{"old":"/api/v1/auth/passkey/login/verify","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/passkey/login/verify","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/passkey/login/verify","type":0,"val":"passkey","end":""},{"old":"/api/v1/auth/passkey/login/verify","type":0,"val":"login","end":""},{"old":"/api/v1/auth/passkey/login/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['passkey.verify_login']['types'],
  },
  'forget_password.request': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forget-password/request',
    tokens: [{"old":"/api/v1/auth/forget-password/request","type":0,"val":"api","end":""},{"old":"/api/v1/auth/forget-password/request","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/forget-password/request","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/forget-password/request","type":0,"val":"forget-password","end":""},{"old":"/api/v1/auth/forget-password/request","type":0,"val":"request","end":""}],
    types: placeholder as Registry['forget_password.request']['types'],
  },
  'forget_password.verify_otp': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forget-password/verify-otp',
    tokens: [{"old":"/api/v1/auth/forget-password/verify-otp","type":0,"val":"api","end":""},{"old":"/api/v1/auth/forget-password/verify-otp","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/forget-password/verify-otp","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/forget-password/verify-otp","type":0,"val":"forget-password","end":""},{"old":"/api/v1/auth/forget-password/verify-otp","type":0,"val":"verify-otp","end":""}],
    types: placeholder as Registry['forget_password.verify_otp']['types'],
  },
  'forget_password.verify_magic_link': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forget-password/verify-magic-link',
    tokens: [{"old":"/api/v1/auth/forget-password/verify-magic-link","type":0,"val":"api","end":""},{"old":"/api/v1/auth/forget-password/verify-magic-link","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/forget-password/verify-magic-link","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/forget-password/verify-magic-link","type":0,"val":"forget-password","end":""},{"old":"/api/v1/auth/forget-password/verify-magic-link","type":0,"val":"verify-magic-link","end":""}],
    types: placeholder as Registry['forget_password.verify_magic_link']['types'],
  },
  'forget_password.get_2_fa_flow': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forget-password/2fa/flow',
    tokens: [{"old":"/api/v1/auth/forget-password/2fa/flow","type":0,"val":"api","end":""},{"old":"/api/v1/auth/forget-password/2fa/flow","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/forget-password/2fa/flow","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/forget-password/2fa/flow","type":0,"val":"forget-password","end":""},{"old":"/api/v1/auth/forget-password/2fa/flow","type":0,"val":"2fa","end":""},{"old":"/api/v1/auth/forget-password/2fa/flow","type":0,"val":"flow","end":""}],
    types: placeholder as Registry['forget_password.get_2_fa_flow']['types'],
  },
  'forget_password.request_2_fa': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forget-password/2fa/request',
    tokens: [{"old":"/api/v1/auth/forget-password/2fa/request","type":0,"val":"api","end":""},{"old":"/api/v1/auth/forget-password/2fa/request","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/forget-password/2fa/request","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/forget-password/2fa/request","type":0,"val":"forget-password","end":""},{"old":"/api/v1/auth/forget-password/2fa/request","type":0,"val":"2fa","end":""},{"old":"/api/v1/auth/forget-password/2fa/request","type":0,"val":"request","end":""}],
    types: placeholder as Registry['forget_password.request_2_fa']['types'],
  },
  'forget_password.verify_2_fa': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forget-password/2fa/verify',
    tokens: [{"old":"/api/v1/auth/forget-password/2fa/verify","type":0,"val":"api","end":""},{"old":"/api/v1/auth/forget-password/2fa/verify","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/forget-password/2fa/verify","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/forget-password/2fa/verify","type":0,"val":"forget-password","end":""},{"old":"/api/v1/auth/forget-password/2fa/verify","type":0,"val":"2fa","end":""},{"old":"/api/v1/auth/forget-password/2fa/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['forget_password.verify_2_fa']['types'],
  },
  'forget_password.reset': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forget-password/reset',
    tokens: [{"old":"/api/v1/auth/forget-password/reset","type":0,"val":"api","end":""},{"old":"/api/v1/auth/forget-password/reset","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/forget-password/reset","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/forget-password/reset","type":0,"val":"forget-password","end":""},{"old":"/api/v1/auth/forget-password/reset","type":0,"val":"reset","end":""}],
    types: placeholder as Registry['forget_password.reset']['types'],
  },
  'account.list_sessions': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/sessions',
    tokens: [{"old":"/api/v1/account/sessions","type":0,"val":"api","end":""},{"old":"/api/v1/account/sessions","type":0,"val":"v1","end":""},{"old":"/api/v1/account/sessions","type":0,"val":"account","end":""},{"old":"/api/v1/account/sessions","type":0,"val":"sessions","end":""}],
    types: placeholder as Registry['account.list_sessions']['types'],
  },
  'account.revoke_session': {
    methods: ["POST"],
    pattern: '/api/v1/account/sessions/:sessionId/revoke',
    tokens: [{"old":"/api/v1/account/sessions/:sessionId/revoke","type":0,"val":"api","end":""},{"old":"/api/v1/account/sessions/:sessionId/revoke","type":0,"val":"v1","end":""},{"old":"/api/v1/account/sessions/:sessionId/revoke","type":0,"val":"account","end":""},{"old":"/api/v1/account/sessions/:sessionId/revoke","type":0,"val":"sessions","end":""},{"old":"/api/v1/account/sessions/:sessionId/revoke","type":1,"val":"sessionId","end":""},{"old":"/api/v1/account/sessions/:sessionId/revoke","type":0,"val":"revoke","end":""}],
    types: placeholder as Registry['account.revoke_session']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
