import mail from '@adonisjs/mail/services/main'
import { type ApplicationService } from '@adonisjs/core/types'
import agenda from '#config/agenda'
import { Message } from '@adonisjs/mail'
import fs from 'node:fs'
import { resolve } from 'pathe'
import mjml2html from 'mjml'
import { Liquid } from 'liquidjs'
import Jobs from '../app/jobs/jobs.js'
import TenantCtx from '#helpers/auth/tenant-ctx'

export default class SendMailProvider {
  private readonly engine: Liquid
  constructor(protected app: ApplicationService) {
    this.engine = new Liquid({
      root: ['resources/emails/'],
    })
  }

  private async renderMjml(templatePath: string, data: any): Promise<string> {
    const root = 'resources/emails/'
    const mjml = await fs.promises.readFile(resolve(root, templatePath), 'utf-8')

    const htmlRaw = await mjml2html(mjml, {
      filePath: resolve(root, templatePath),
      preprocessors: [(xml: string) => this.engine.parseAndRenderSync(xml, data)],
      ignoreIncludes: false,
    })

    return htmlRaw.html
  }

  public async ready() {
    ;(Message as any).macro('forTenant', function (this: any, tenant: TenantCtx) {
      this.tenant = tenant
      return this
    })

    const originalToObject = Message.prototype.toObject
    Message.prototype.toObject = function (this: any) {
      const originalData = originalToObject.call(this) as any
      originalData.tenant = this.tenant?.toObject()
      return originalData
    }

    Message.templateEngine = {
      render: async (templatePath, helpers, data) => {
        return await this.renderMjml(templatePath, { ...data, ...helpers })
      },
    }

    mail.setMessenger((mailer) => {
      return {
        async queue(mailMessage, config) {
          const job = agenda.create(Jobs.SendEmail, {
            mailMessage,
            config,
            mailerName: mailer.name,
          })

          if (mailMessage.message.priority) {
            job.priority(mailMessage.message.priority)
          }

          await job.save()
        },
      }
    })
  }
}
