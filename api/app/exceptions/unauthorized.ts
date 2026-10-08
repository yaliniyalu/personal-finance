import HttpException from '#exceptions/http-exception'

export default class Unauthorized extends HttpException {
  constructor(message: string, code?: string, data?: any) {
    super(401, message, code, data)
  }
}
