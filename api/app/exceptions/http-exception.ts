import { Exception } from '@adonisjs/core/exceptions'
import Env from '#start/env'

export default class HttpException extends Exception {
  constructor(
    statusCode: number,
    message: string,
    code?: string,
    public data?: any
  ) {
    super(message, {
      code,
      status: statusCode,
    })
  }

  toJSON() {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      data: this.data,
    }
  }

  toRedactedJSON() {
    return {
      status: this.status,
      code: this.code,
      message: Env.get('NODE_ENV') === 'production' ? 'Internal Server Error' : this.message,
      data: Env.get('NODE_ENV') === 'production' ? {} : this.data,
    }
  }
}
