import { Exception } from '@adonisjs/core/exceptions'
import Env from '#start/env'

export default class RedactableException extends Exception {
  toJSON() {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
    }
  }

  toRedactedJSON() {
    return {
      status: this.status,
      code: this.code,
      message: Env.get('NODE_ENV') === 'production' ? 'Internal Server Error' : this.message,
    }
  }

  static fromError(error: Error) {
    const ex = new RedactableException(error.message, { code: error.name, status: 500 })
    ex.stack = error.stack
    return ex
  }
}
