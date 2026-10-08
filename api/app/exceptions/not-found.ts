import HttpException from '#exceptions/http-exception'

export default class NotFound extends HttpException {
  constructor(message: string, code?: string, data?: any) {
    super(404, message, code, data)
  }
}
