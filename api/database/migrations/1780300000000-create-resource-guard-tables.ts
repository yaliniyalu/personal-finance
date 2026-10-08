import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('resource_policies', (table) => {
      table.string('id', 200).primary()
      table.string('resource', 200).notNullable()
      table.jsonb('dimensions').nullable()
      table.string('scope_type', 20).notNullable()
      table.string('scope_id', 200).nullable()
      table.string('limit_type', 20).notNullable()
      table.decimal('limit', 20, 6).notNullable()
      table.integer('window_size').nullable()
      table.string('window_unit', 20).nullable()
      table.string('enforcement', 20).notNullable().defaultTo('HARD')
      table.integer('priority').notNullable().defaultTo(0)
      table.boolean('enabled').notNullable().defaultTo(true)
      table.timestamp('valid_from', { useTz: true }).nullable()
      table.timestamp('valid_until', { useTz: true }).nullable()
      table.jsonb('metadata').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['resource', 'enabled'], 'resource_policies_resource_enabled_idx')
    })

    this.schema.createTable('resource_reservations', (table) => {
      table.uuid('id').primary()
      table.string('resource', 200).notNullable()
      table.decimal('reserved_amount', 20, 6).notNullable()
      table.decimal('actual_amount', 20, 6).nullable()
      table.string('status', 20).notNullable()
      table.string('operation_id', 200).nullable()
      table.jsonb('request').notNullable()
      table.jsonb('policy_states').notNullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['resource', 'status'], 'resource_reservations_resource_status_idx')
      table.index(['expires_at'], 'resource_reservations_expires_at_idx')
    })

    this.schema.createTable('resource_leases', (table) => {
      table.uuid('id').primary()
      table.string('resource', 200).notNullable()
      table.string('status', 20).notNullable()
      table.string('operation_id', 200).nullable()
      table.jsonb('request').notNullable()
      table.jsonb('policy_states').notNullable()
      table.timestamp('acquired_at', { useTz: true }).notNullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('released_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['resource', 'status'], 'resource_leases_resource_status_idx')
      table.index(['expires_at'], 'resource_leases_expires_at_idx')
    })

    this.schema.createTable('resource_usage_logs', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('resource_type', 200).notNullable()
      table.string('action', 30).notNullable()
      table.string('status', 30).notNullable()
      table.uuid('user_id').nullable()
      table.uuid('tenant_id').nullable()
      table.string('ip_address', 64).nullable()
      table.string('user_agent', 1000).nullable()
      table.integer('duration_ms').nullable()
      table.jsonb('details').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['resource_type', 'created_at'], 'resource_usage_logs_resource_created_idx')
      table.index(['user_id', 'created_at'], 'resource_usage_logs_user_created_idx')
      table.index(['tenant_id', 'created_at'], 'resource_usage_logs_tenant_created_idx')
    })
  }

  async down() {
    this.schema.dropTable('resource_usage_logs')
    this.schema.dropTable('resource_leases')
    this.schema.dropTable('resource_reservations')
    this.schema.dropTable('resource_policies')
  }
}
