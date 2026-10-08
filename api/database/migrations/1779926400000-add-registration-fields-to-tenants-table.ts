import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tenants'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('organization_type', 100).notNullable().defaultTo('business')
      table.string('contact_name', 255).notNullable().defaultTo('')
      table.string('mobile_number', 20).notNullable().defaultTo('')
      table.string('country_code', 10).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('organization_type')
      table.dropColumn('contact_name')
      table.dropColumn('mobile_number')
      table.dropColumn('country_code')
    })
  }
}
