import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const passkeyRegisterVerifyValidator = vine.create(
  vine.object({
    challengeToken: vine.string().trim(),
    credential: vine.object({
      id: vine.string(),
      rawId: vine.string(),
      type: vine.literal('public-key'),
      response: vine.record(vine.any()),
      clientExtensionResults: vine.record(vine.any()),
      authenticatorAttachment: vine.string().optional(),
    }),
  })
)

export type PasskeyRegisterVerifyInput = Infer<typeof passkeyRegisterVerifyValidator>

export const passkeyLoginVerifyValidator = vine.create(
  vine.object({
    challengeToken: vine.string().trim(),
    credential: vine.object({
      id: vine.string(),
      rawId: vine.string(),
      type: vine.literal('public-key'),
      response: vine.record(vine.any()),
      clientExtensionResults: vine.record(vine.any()),
      authenticatorAttachment: vine.string().optional(),
    }),
  })
)

export type PasskeyLoginVerifyInput = Infer<typeof passkeyLoginVerifyValidator>
