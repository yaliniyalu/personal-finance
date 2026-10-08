import type { Job, JobDefinition } from 'agenda'

/** Aligns with `agenda` JobPriority (not re-exported from package root). */
type AgendaJobPriority = number | 'lowest' | 'low' | 'normal' | 'high' | 'highest'

export interface AgendaJob<ARGS> {
  handle(job: Job, args: ARGS): Promise<void>
}

type JobOptions = Partial<Pick<JobDefinition, 'lockLimit' | 'lockLifetime' | 'concurrency'>> & {
  priority?: AgendaJobPriority
}

type CronOptions = {
  timezone?: string
  skipImmediate?: boolean
  forkMode?: boolean
}

const jobs = new Map<
  string,
  {
    job: AgendaJob<any>
    schedule?: string
    jobOptions?: JobOptions
    cronOptions?: CronOptions
  }
>()

export function RegisterAgendaJob(name: string, jobOptions?: JobOptions) {
  return function (target: any) {
    jobs.set(name, {
      job: target,
      jobOptions,
    })
  }
}

export function ScheduleAgendaJob(
  name: string,
  schedule: string,
  cronOptions?: CronOptions,
  jobOptions?: JobOptions
) {
  return function (target: any) {
    jobs.set(name, {
      job: target,
      schedule,
      jobOptions,
      cronOptions,
    })
  }
}

export default jobs
