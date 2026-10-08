type DateInput = Date | string | number | null | undefined

function parseDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = parseDate(value)

  if (!date) return '—'

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...options,
  }).format(date)
}

export function formatTime(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = parseDate(value)

  if (!date) return '—'

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    ...options,
  }).format(date)
}

export function formatDateTime(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = parseDate(value)

  if (!date) return '—'

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    ...options,
  }).format(date)
}
