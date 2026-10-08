import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const revokeSessionParamsValidator = vine.create(
  vine.object({
    sessionId: vine.string().trim(),
  })
)

export type RevokeSessionParamsValidator = Infer<typeof revokeSessionParamsValidator>
