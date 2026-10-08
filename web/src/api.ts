import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15_000,
})

export function setApiAccessToken(accessToken: string | null) {
  if (accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

let onUnauthorized: ((accessToken: string) => void) | undefined

export function setUnauthorizedHandler(handler: (accessToken: string) => void) {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const authorization = error.config?.headers?.Authorization
      if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
        onUnauthorized?.(authorization.slice(7))
      }
    }

    return Promise.reject(error)
  },
)

export default api
