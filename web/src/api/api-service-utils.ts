import type { ApiResponse } from '@ws/shared/api'

export type PathParams = Record<string, string | number | boolean | null | undefined>
export type QueryParams = Record<string, unknown>

export interface ServiceArgs<TBody = unknown> {
  path?: PathParams
  query?: QueryParams
  body?: TBody
}

export function buildPath(template: string, path?: PathParams): string {
  if (!path) {
    return template
  }

  return Object.entries(path).reduce((resolvedPath, [key, value]) => {
    return resolvedPath.replace(`:${key}`, encodeURIComponent(String(value ?? '')))
  }, template)
}

export function unwrapData<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message)
  }

  return response.data
}
