import { dotToObj } from '@/helpers/general.ts'

const ErrorHelper = {
  message(error: any) {
    if (typeof error === 'string') {
      return error
    }

    if (error.name === 'ZodError') {
      return error.issues.map((e: { message: string }) => e.message).join(', ')
    }

    if (error.response?.data?.errors?.length) {
      return error.response.data.errors[0].message
    }

    return error.response?.data?.message || error.message || 'Something went wrong'
  },

  isCode(error: any, code: string) {
    return error.response?.data?.code === code
  },

  getValidationErrorObj(error: any) {
    const obj = {}
    error?.response?.data?.errors?.forEach((dt: any) => {
      dotToObj(obj, dt.field, dt.message)
    })
    return obj
  },
}

export default ErrorHelper
