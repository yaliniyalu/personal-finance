export interface ApiSuccessResponse<TData> {
  success: true
  message?: string
  data: TData
}

export interface ApiErrorResponse {
  success: false
  message: string
  code?: string | number
  data?: unknown
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse
