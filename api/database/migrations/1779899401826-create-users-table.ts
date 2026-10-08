import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    /**
     * Enable extensions
     */
    this.schema.raw(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)
    this.schema.raw(`CREATE EXTENSION IF NOT EXISTS "citext"`)

    /**
     * tenants
     */
    this.schema.createTable('tenants', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.string('username', 50).notNullable().unique()
      table.string('name', 255).notNullable()
      table.string('email', 255).notNullable().unique()

      table.string('status', 20).notNullable().defaultTo('active')

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })

    /**
     * users
     */
    this.schema.createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE')
      table.string('user_type', 50).notNullable()
      table.string('name', 255)
      table.string('status', 20).notNullable().defaultTo('active')

      table.uuid('primary_email_id').nullable()
      table.uuid('primary_mobile_id').nullable()

      table.string('password_hash').nullable()

      table.timestamp('last_login_at', { useTz: true })
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.timestamp('deleted_at', { useTz: true })

      table.index(['tenant_id'])
    })

    /**
     * user_emails
     */
    this.schema.createTable('user_emails', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE')

      table.specificType('email', 'CITEXT').notNullable()

      table.boolean('is_primary').notNullable().defaultTo(false)
      table.boolean('is_verified').notNullable().defaultTo(false)
      table.timestamp('verified_at', { useTz: true })

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())

      table.unique(['tenant_id', 'email'])
      table.index(['email'])
    })

    /**
     * user_mobiles
     */
    this.schema.createTable('user_mobiles', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE')

      table.string('country_code', 10)
      table.string('mobile_number', 20).notNullable()

      table.boolean('is_primary').notNullable().defaultTo(false)
      table.boolean('is_verified').notNullable().defaultTo(false)

      table.timestamp('verified_at', { useTz: true })
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())

      table.unique(['tenant_id', 'mobile_number'])
      table.index(['mobile_number'])
    })

    /**
     * mfa_methods
     */
    this.schema.createTable('mfa_methods', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')

      /**
       * sms
       * totp
       * passkey
       */
      table.string('method_type', 30).notNullable()

      table.boolean('is_enabled').notNullable().defaultTo(true)

      table.boolean('is_primary').notNullable().defaultTo(false)

      /**
       * TOTP
       */
      table.text('secret_encrypted')

      /**
       * WebAuthn / Passkeys
       */
      table.text('credential_id')
      table.text('public_key')
      table.bigInteger('counter')

      /**
       * SMS MFA
       */
      table.uuid('mobile_id').references('id').inTable('user_mobiles').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('last_used_at', { useTz: true })
    })

    /**
     * user_sessions
     */
    this.schema.createTable('user_sessions', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.text('refresh_token_hash').notNullable()
      table.string('device_name', 255)
      table.string('device_os', 100)
      table.string('browser', 100)
      table.specificType('ip_address', 'INET')
      table.text('user_agent')
      table.string('location', 255)
      table.timestamp('revoked_at', { useTz: true })
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('last_seen_at', { useTz: true })

      table.index(['user_id'])
    })

    /**
     * otp_challenges
     */
    this.schema.createTable('otp_challenges', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')

      /**
       * login
       * password_reset
       * mfa
       * mobile_verify
       */
      table.string('challenge_type', 30).notNullable()

      table.string('destination', 255)

      table.text('code_hash').notNullable()

      table.integer('attempt_count').notNullable().defaultTo(0)

      table.integer('max_attempts').notNullable().defaultTo(5)

      table.timestamp('expires_at', { useTz: true }).notNullable()

      table.timestamp('verified_at', { useTz: true })

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())

      table.index(['expires_at'])
    })

    /**
     * security_events
     */
    this.schema.createTable('security_events', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL')

      /**
       * suspicious_login
       * password_changed
       * mfa_disabled
       * session_revoked
       * brute_force_detected
       */
      table.string('event_type', 100).notNullable()

      table.string('severity', 20)

      table.jsonb('metadata')

      table.specificType('ip_address', 'INET')

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())

      table.index(['event_type'])
      table.index(['created_at'])
    })

    /**
     * Partial indexes
     */
    this.schema.raw(`
      CREATE UNIQUE INDEX uq_primary_email_per_user
      ON user_emails(user_id)
      WHERE is_primary = true
    `)

    this.schema.raw(`
      CREATE UNIQUE INDEX uq_primary_mobile_per_user
      ON user_mobiles(user_id)
      WHERE is_primary = true
    `)

    this.schema.raw(`
      CREATE UNIQUE INDEX uq_primary_mfa_per_user
      ON mfa_methods(user_id)
      WHERE is_primary = true
    `)
  }

  async down() {
    this.schema.dropTableIfExists('security_events')
    this.schema.dropTableIfExists('otp_challenges')
    this.schema.dropTableIfExists('user_sessions')
    this.schema.dropTableIfExists('mfa_methods')
    this.schema.dropTableIfExists('user_mobiles')
    this.schema.dropTableIfExists('user_emails')
    this.schema.dropTableIfExists('users')
    this.schema.dropTableIfExists('tenants')
  }
}
