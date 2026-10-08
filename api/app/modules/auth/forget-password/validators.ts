import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const forgetPasswordRequestValidator = vine.create(
  vine.object({
    email: vine.string().trim().email(),
  })
)

export const forgetPasswordVerifyOtpValidator = vine.create(
  vine.object({
    challengeId: vine.string().trim(),
    code: vine.string().trim().fixedLength(6),
  })
)

export const forgetPasswordVerifyMagicLinkValidator = vine.create(
  vine.object({
    token: vine.string().trim(),
  })
)

export const forgetPassword2faFlowValidator = vine.create(
  vine.object({
    email: vine.string().trim().email(),
  })
)

export const forgetPassword2faRequestValidator = vine.create(
  vine.object({
    challengeToken: vine.string().trim(),
    method: vine.enum(['sms', 'totp'] as const),
  })
)

export const forgetPassword2faVerifyValidator = vine.create(
  vine.object({
    challengeToken: vine.string().trim(),
    method: vine.enum(['sms', 'totp'] as const),
    code: vine.string().trim(),
    challengeId: vine.string().trim().optional(),
  })
)

export const forgetPasswordResetValidator = vine.create(
  vine.object({
    resetToken: vine.string().trim(),
    newPassword: vine.string().minLength(8),
  })
)

export type ForgetPasswordRequestValidator = Infer<typeof forgetPasswordRequestValidator>
export type ForgetPasswordVerifyOtpValidator = Infer<typeof forgetPasswordVerifyOtpValidator>
export type ForgetPasswordVerifyMagicLinkValidator = Infer<typeof forgetPasswordVerifyMagicLinkValidator>
export type ForgetPassword2faFlowValidator = Infer<typeof forgetPassword2faFlowValidator>
export type ForgetPassword2faRequestValidator = Infer<typeof forgetPassword2faRequestValidator>
export type ForgetPassword2faVerifyValidator = Infer<typeof forgetPassword2faVerifyValidator>
export type ForgetPasswordResetValidator = Infer<typeof forgetPasswordResetValidator>
