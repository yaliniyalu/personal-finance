import HttpException from '#exceptions/http-exception'

export default class BadRequest extends HttpException {
  constructor(message: string, code?: string, data?: any) {
    super(400, message, code, data)
  }
}
