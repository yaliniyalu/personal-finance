import type { Job } from 'agenda'
import { AgendaJob, RegisterAgendaJob } from './registry.ts'
import mail from '@adonisjs/mail/services/main'
import Env from '#start/env'
import { cdn, tenantUrl } from '#helpers/utils'
import { MessageBodyTemplates, NodeMailerMessage } from '@adonisjs/mail/types'
import Jobs from './jobs.js'
import Tenant from '#models/tenant'
import { MailersList } from '@adonisjs/mail/types'

interface MailArgs {
  mailMessage: {
    message: NodeMailerMessage
    views: MessageBodyTemplates
    tenant?: Tenant
  }
  config: any
  mailerName?: keyof MailersList
}

@RegisterAgendaJob(Jobs.SendEmail)
export class SendEmailJob implements AgendaJob<MailArgs> {
  async handle(_job: Job, args: MailArgs) {
    const { mailMessage, config, mailerName } = args

    const ctx = await this.getContext(mailMessage.tenant)

    if (mailMessage.views.html) {
      mailMessage.views.html.data = {
        ...mailMessage.views.html.data,
        ...ctx,
      }
    }

    if (mailMessage.views.text) {
      mailMessage.views.text.data = {
        ...mailMessage.views.text.data,
        ...ctx,
      }
    }

    if (mailMessage.views.watch) {
      mailMessage.views.watch.data = {
        ...mailMessage.views.watch.data,
        ...ctx,
      }
    }

    await mail.use(mailerName).sendCompiled(mailMessage, config)
  }

  private async getContext(tenant?: Tenant) {
    console.log(tenant)
    let tenantData
    if (tenant) {
      tenantData = {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.username,
        url: tenantUrl(tenant.username),
      }
    }

    return {
      app: {
        name: Env.get('APP_NAME'),
        supportEmail: Env.get('SUPPORT_EMAIL'),
        address: Env.get('ADDRESS'),
        unsubscribeLink: Env.get('UNSUBSCRIBE_LINK'),
        privacyLink: Env.get('PRIVACY_LINK'),
        termsLink: Env.get('TERMS_LINK'),
        currentYear: new Date().getFullYear(),
        theme: Env.get('APP_THEME'),
        logo: cdn('logo/logo.png'),
        url: Env.get('APP_URL'),
        ...(tenantData ? { tenant: tenantData } : {}),
      },
    }
  }
}
