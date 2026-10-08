/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.identify_login_flow': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login/identifier'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.login_with_password': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login/password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.request_otp_login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login/otp/request'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.verify_otp_login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login/otp/verify'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.verify_magic_link_login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login/magic-link/verify'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.request_2_fa': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login/2fa/request'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.get_2_fa_flow': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login/2fa/flow'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.verify_2_fa': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login/2fa/verify'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.social_google_login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/social/google'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.register_check_email': {
    methods: ["POST"]
    pattern: '/api/v1/auth/register/check-email'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.register_check_username': {
    methods: ["POST"]
    pattern: '/api/v1/auth/register/check-username'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.register': {
    methods: ["POST"]
    pattern: '/api/v1/auth/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.request_email_verification': {
    methods: ["POST"]
    pattern: '/api/v1/auth/register/verify-email/request'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.confirm_email_verification': {
    methods: ["POST"]
    pattern: '/api/v1/auth/register/verify-email/confirm'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'passkey.get_registration_options': {
    methods: ["POST"]
    pattern: '/api/v1/auth/passkey/register/options'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'passkey.verify_registration': {
    methods: ["POST"]
    pattern: '/api/v1/auth/passkey/register/verify'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'passkey.get_login_options': {
    methods: ["POST"]
    pattern: '/api/v1/auth/passkey/login/options'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'passkey.verify_login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/passkey/login/verify'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'forget_password.request': {
    methods: ["POST"]
    pattern: '/api/v1/auth/forget-password/request'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'forget_password.verify_otp': {
    methods: ["POST"]
    pattern: '/api/v1/auth/forget-password/verify-otp'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'forget_password.verify_magic_link': {
    methods: ["POST"]
    pattern: '/api/v1/auth/forget-password/verify-magic-link'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'forget_password.get_2_fa_flow': {
    methods: ["POST"]
    pattern: '/api/v1/auth/forget-password/2fa/flow'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'forget_password.request_2_fa': {
    methods: ["POST"]
    pattern: '/api/v1/auth/forget-password/2fa/request'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'forget_password.verify_2_fa': {
    methods: ["POST"]
    pattern: '/api/v1/auth/forget-password/2fa/verify'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'forget_password.reset': {
    methods: ["POST"]
    pattern: '/api/v1/auth/forget-password/reset'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'account.list_sessions': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/sessions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'account.revoke_session': {
    methods: ["POST"]
    pattern: '/api/v1/account/sessions/:sessionId/revoke'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { sessionId: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
}
