export type Nullable<T> = T | null | undefined
export type MaybePromise<T> = T | Promise<T>

export function isDefined<T>(value: Nullable<T>): value is T {
  return value !== null && value !== undefined
}

export function assertNever(_value: never, message = 'Unexpected value'): never {
  throw new Error(message)
}
