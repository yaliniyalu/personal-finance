import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { createAgenda } from '#config/agenda'
import jobs, { type AgendaJob } from '../app/jobs/registry.js'
import importModule from '#helpers/auto-importer'

export default class AgendaCommand extends BaseCommand {
  static commandName = 'agenda'
  static description = 'Start Agenda worker to process background jobs'

  static options: CommandOptions = {
    staysAlive: true,
    startApp: true,
  }

  async run() {
    await importModule({
      path: './app/jobs',
      excludePatterns: [/(jobs|registry)\.(ts|js)$/],
    })

    const agenda = createAgenda()

    for (const [name, job] of jobs) {
      this.logger.info(`Registering job: ${name}`)
      agenda.define(
        name,
        async (j) => {
          this.logger.info(`Running job: ${name}`)
          try {
            const obj: AgendaJob<any> = await this.app.container.make(job.job)
            await obj.handle(j, j.attrs.data)
          } catch (error) {
            this.logger.error(`Error running job: ${name}`)
            console.error(error)
          }
        },
        job.jobOptions as any
      )
    }

    for (const [name, job] of jobs) {
      if (job.schedule) {
        this.logger.info(`Scheduling job: ${name}`)
        await agenda.every(job.schedule, name, undefined, job.cronOptions)
      }
    }

    const stopAgenda = async () => {
      this.logger.info('Stopping Agenda...')
      await agenda.stop()
      process.exit(0)
    }

    process.once('SIGINT', stopAgenda)
    process.once('SIGTERM', stopAgenda)

    await agenda.start()
    this.logger.success('Agenda started and listening for jobs')
  }
}
