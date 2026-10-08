import HttpException from '#exceptions/http-exception'

export default class Forbidden extends HttpException {
  constructor(message: string, code?: string, data?: any) {
    super(403, message, code, data)
  }
}
