import HttpException from '#exceptions/http-exception'

export default class PaymentRequired extends HttpException {
  constructor(message: string, code?: string, data?: any) {
    super(402, message, code, data)
  }
}
