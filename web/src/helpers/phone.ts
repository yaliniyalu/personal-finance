import { parsePhoneNumberFromString } from 'libphonenumber-js'

export type PhoneValidationResult = { ok: true; e164: string | null } | { ok: false; error: string }

/**
 * Matches backend behavior (phone package with strictDetection):
 * - optional field (empty => null)
 * - requires leading '+' country code
 * - returns normalized E.164 on success
 */
export function validateAndFormatE164PhoneNumber(input: string): PhoneValidationResult {
  const raw = (input ?? '').trim()
  if (!raw) {
    return { ok: true, e164: null }
  }

  if (!raw.startsWith('+')) {
    return { ok: false, error: 'Phone number must start with + and include country code' }
  }

  const parsed = parsePhoneNumberFromString(raw)
  if (!parsed || !parsed.isValid()) {
    return { ok: false, error: 'Invalid phone number' }
  }

  return { ok: true, e164: parsed.number }
}
