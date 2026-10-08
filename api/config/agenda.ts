import { Agenda } from 'agenda'
import { PostgresBackend } from '@agendajs/postgres-backend'
import Env from '#start/env'

export function createAgenda(): Agenda {
  return new Agenda({
    backend: new PostgresBackend({
      poolConfig: {
        host: Env.get('PG_HOST'),
        port: Env.get('PG_PORT'),
        database: Env.get('PG_DB_NAME'),
        user: Env.get('PG_USER'),
        password: Env.get('PG_PASSWORD'),
      },
      ensureSchema: true,
    }),
  })
}

const agenda = createAgenda()

export default agenda
