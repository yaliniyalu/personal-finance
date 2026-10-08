import HttpException from '#exceptions/http-exception'

export default class InternalServerException extends HttpException {
  constructor(message: string, code?: string, data?: any) {
    super(500, message, code, data)
  }
}
