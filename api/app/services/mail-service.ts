import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import { Message } from '@adonisjs/mail'

@inject()
export default class MailService {
  /**
   * Send mail immediately
   */
  async send(cb: (message: Message) => void) {
    await mail.send((message) => {
      cb(message)
    })
  }

  /**
   * Queue mail for later delivery
   */
  async sendLater(cb: (message: Message) => void) {
    await mail.sendLater((message) => {
      cb(message)
    })
  }
}
