import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('mfa_methods', (table) => {
      table.string('aaguid', 64).nullable()
      table.text('transports').nullable()
    })
  }

  async down() {
    this.schema.alterTable('mfa_methods', (table) => {
      table.dropColumn('aaguid')
      table.dropColumn('transports')
    })
  }
}
