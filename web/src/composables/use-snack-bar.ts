import { push, type NotificationClearMethods, type PushOptions, type PushParameter, type PushPromiseReturn } from 'notivue'
import { isRef } from 'vue'

type SnackBarSeverity = 'success' | 'info' | 'warning' | 'error'
type SnackBarOptions = PushParameter | (PushOptions & { severity?: SnackBarSeverity })
type SnackBarPromise = Omit<NotificationClearMethods & PushPromiseReturn, 'error'> & {
  update: (options: SnackBarOptions) => void
  error: (err: unknown, fallback?: string) => void
}

function getSeverity(options: SnackBarOptions, severity?: SnackBarSeverity): SnackBarSeverity {
  if (typeof options === 'object' && options !== null && !isRef(options) && 'severity' in options && options.severity) {
    return options.severity
  }

  return severity || 'info'
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message || 'Something went wrong.'
  if (error && typeof error === 'object') {
    const value = error as { response?: { data?: { message?: unknown; errors?: { message?: unknown }[] } }; message?: unknown }
    const apiErrors = value.response?.data?.errors
    if (apiErrors?.length && typeof apiErrors[0]?.message === 'string') return apiErrors[0].message
    if (typeof value.response?.data?.message === 'string') return value.response.data.message
    if (typeof value.message === 'string') return value.message
  }
  return 'Something went wrong.'
}

export default function useSnackBar() {
  const showSnackBar = (options: SnackBarOptions, severity?: SnackBarSeverity): NotificationClearMethods => {
    switch (getSeverity(options, severity)) {
      case 'success': return push.success(options)
      case 'warning': return push.warning(options)
      case 'error': return push.error(options)
      default: return push.info(options)
    }
  }

  function promise(options: SnackBarOptions): SnackBarPromise {
    let current = push.promise(options)

    return {
      clear: () => current.clear(),
      destroy: () => current.destroy(),
      resolve: (nextOptions: PushParameter) => current.resolve(nextOptions),
      success: (nextOptions: PushParameter) => current.success(nextOptions),
      reject: (nextOptions: PushParameter) => current.reject(nextOptions),
      error: (error: unknown, fallback?: string) => {
        if (typeof error === 'string' && !fallback) return current.error(error)
        return current.error({ title: fallback || 'Something went wrong.', message: getErrorMessage(error) })
      },
      update: (nextOptions: SnackBarOptions) => {
        current.clear()
        current = push.promise(nextOptions)
      },
    }
  }

  function success(options: SnackBarOptions) { return showSnackBar(options, 'success') }
  function info(options: SnackBarOptions) { return showSnackBar(options, 'info') }
  function warn(options: SnackBarOptions) { return showSnackBar(options, 'warning') }
  function danger(options: SnackBarOptions) { return showSnackBar(options, 'error') }
  function error(err: unknown, fallback?: string) {
    return showSnackBar({ title: fallback || 'Something went wrong.', message: getErrorMessage(err) }, 'error')
  }

  return { success, info, warn, danger, promise, error, clearAll: () => push.clearAll(), destroyAll: () => push.destroyAll() }
}
