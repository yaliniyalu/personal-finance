export default {
  success: (data?: any, message?: string) => {
    return {
      success: true,
      message,
      data,
    }
  },

  error: (message: string, code?: string | number, data?: any) => {
    return {
      success: false,
      message,
      code,
      data,
    }
  },
}
