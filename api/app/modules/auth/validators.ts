import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const loginIdentifierValidator = vine.create(
  vine.object({
    identifier: vine.string().trim(),
  })
)

export const loginPasswordValidator = vine.create(
  vine.object({
    identifier: vine.string().trim(),
    password: vine.string().minLength(8),
  })
)

export const loginOtpRequestValidator = vine.create(
  vine.object({
    identifier: vine.string().trim(),
  })
)

export const loginOtpVerifyValidator = vine.create(
  vine.object({
    challengeId: vine.string().trim(),
    code: vine.string().trim().fixedLength(6),
  })
)

export const loginMagicLinkVerifyValidator = vine.create(
  vine.object({
    token: vine.string().trim(),
  })
)

export const login2faRequestValidator = vine.create(
  vine.object({
    identifier: vine.string().trim(),
    method: vine.enum(['sms', 'totp'] as const),
  })
)

export const login2faFlowValidator = vine.create(
  vine.object({
    identifier: vine.string().trim(),
  })
)

export const login2faVerifyValidator = vine.create(
  vine.object({
    identifier: vine.string().trim(),
    method: vine.enum(['sms', 'totp'] as const),
    code: vine.string().trim(),
    challengeId: vine.string().trim().optional(),
  })
)

export const socialGoogleLoginValidator = vine.create(
  vine.object({
    idToken: vine.string().trim(),
  })
)

export const registerCheckEmailValidator = vine.create(
  vine.object({
    email: vine.string().trim().email(),
  })
)

export const registerCheckUsernameValidator = vine.create(
  vine.object({
    username: vine.string().trim().minLength(3).maxLength(50),
  })
)

export const registerValidator = vine.create(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(8),
    organizationName: vine.string().trim().minLength(2).maxLength(255),
    organizationType: vine.string().trim().minLength(2).maxLength(100),
    username: vine.string().trim().minLength(3).maxLength(50),
    name: vine.string().trim().minLength(2).maxLength(255),
    mobileNumber: vine.string().trim().minLength(8).maxLength(20),
    countryCode: vine.string().trim().maxLength(10).optional(),
    acceptTerms: vine.boolean(),
    acceptPrivacyPolicy: vine.boolean(),
  })
)

export const verifyEmailRequestValidator = vine.create(
  vine.object({
    email: vine.string().trim().email(),
  })
)

export const verifyEmailConfirmValidator = vine.create(
  vine.object({
    token: vine.string().trim(),
  })
)

export type LoginIdentifierValidator = Infer<typeof loginIdentifierValidator>
export type LoginPasswordValidator = Infer<typeof loginPasswordValidator>
export type LoginOtpRequestValidator = Infer<typeof loginOtpRequestValidator>
export type LoginOtpVerifyValidator = Infer<typeof loginOtpVerifyValidator>
export type LoginMagicLinkVerifyValidator = Infer<typeof loginMagicLinkVerifyValidator>
export type Login2faRequestValidator = Infer<typeof login2faRequestValidator>
export type Login2faFlowValidator = Infer<typeof login2faFlowValidator>
export type Login2faVerifyValidator = Infer<typeof login2faVerifyValidator>
export type SocialGoogleLoginValidator = Infer<typeof socialGoogleLoginValidator>
export type RegisterCheckEmailValidator = Infer<typeof registerCheckEmailValidator>
export type RegisterCheckUsernameValidator = Infer<typeof registerCheckUsernameValidator>
export type RegisterValidator = Infer<typeof registerValidator>
export type VerifyEmailRequestValidator = Infer<typeof verifyEmailRequestValidator>
export type VerifyEmailConfirmValidator = Infer<typeof verifyEmailConfirmValidator>
