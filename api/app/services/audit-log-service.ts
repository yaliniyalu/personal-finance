import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import AuthContext from '#helpers/auth/auth-context'
import AuditLog, { type AuditAction } from '#models/audit-log'

@inject()
export default class AuditLogService {
  constructor(
    private readonly authCtx: AuthContext,
    private readonly ctx: HttpContext
  ) {}

  public async log(input: LogAuditEntryInput) {
    await AuditLog.create({
      tenantId: input.tenantId ?? null,
      userId: input.userId ?? this.authCtx.user.id,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      changes: input.changes ?? null,
      requestId: this.resolveRequestId(),
      description: input.description?.trim() || null,
      ipAddress: this.resolveIpAddress(),
      userAgent: this.ctx.request.header('user-agent') ?? null,
    })
  }

  public async logCreate(input: CreateAuditEntryInput) {
    await this.log({
      ...input,
      action: 'CREATE',
      changes: {
        after: input.after ?? null,
      },
    })
  }

  public async logUpdate(input: UpdateAuditEntryInput) {
    await this.log({
      ...input,
      action: 'UPDATE',
      changes: {
        before: input.before ?? null,
        after: input.after ?? null,
      },
    })
  }

  public async logDelete(input: DeleteAuditEntryInput) {
    await this.log({
      ...input,
      action: 'DELETE',
      changes: {
        before: input.before ?? null,
      },
    })
  }

  public async list(filters: ListAuditLogsInput) {
    const tenantId = this.authCtx.user.tenantId
    const query = db
      .from('audit_logs')
      .leftJoin('users', 'users.id', 'audit_logs.user_id')
      .leftJoin('tenants', 'tenants.id', 'audit_logs.tenant_id')
      .leftJoin('user_emails', function () {
        this.on('user_emails.user_id', '=', 'users.id').andOnVal(
          'user_emails.is_primary',
          '=',
          true
        )
      })
      .where('audit_logs.tenant_id', tenantId)
      .select(
        'audit_logs.id',
        'audit_logs.tenant_id as tenantId',
        'audit_logs.user_id as userId',
        'audit_logs.action',
        'audit_logs.entity_type as entityType',
        'audit_logs.entity_id as entityId',
        'audit_logs.changes',
        'audit_logs.request_id as requestId',
        'audit_logs.created_at as createdAt',
        'audit_logs.description',
        'audit_logs.ip_address as ipAddress',
        'audit_logs.user_agent as userAgent',
        'users.name as userName',
        'user_emails.email as userEmail',
        'tenants.name as tenantName'
      )
      .orderBy('audit_logs.created_at', 'desc')

    if (filters.dateFrom) {
      query.where('audit_logs.created_at', '>=', startOfDay(filters.dateFrom))
    }

    if (filters.dateTo) {
      query.where('audit_logs.created_at', '<=', endOfDay(filters.dateTo))
    }

    if (filters.userId) {
      query.where('audit_logs.user_id', filters.userId)
    }

    if (filters.tenantId) {
      query.where('audit_logs.tenant_id', filters.tenantId)
    }

    if (filters.action) {
      query.where('audit_logs.action', filters.action)
    }

    if (filters.entityType) {
      query.where('audit_logs.entity_type', filters.entityType)
    }

    if (filters.entityId) {
      query.where('audit_logs.entity_id', filters.entityId)
    }

    const [items, entityTypeRows] = await Promise.all([
      query,
      db
        .from('audit_logs')
        .leftJoin('users', 'users.id', 'audit_logs.user_id')
        .leftJoin('tenants', 'tenants.id', 'audit_logs.tenant_id')
        .where('audit_logs.tenant_id', tenantId)
        .distinct('audit_logs.entity_type as entityType')
        .orderBy('audit_logs.entity_type', 'asc'),
    ])

    return {
      items: items.map((item) => ({
        id: item.id,
        tenantId: item.tenantId,
        tenantName: item.tenantName,
        userId: item.userId,
        userName: item.userName,
        userEmail: item.userEmail,
        action: item.action as AuditAction,
        entityType: item.entityType,
        entityId: item.entityId,
        changes: item.changes ?? null,
        requestId: item.requestId,
        createdAt: toIsoDateTime(item.createdAt),
        description: item.description,
        ipAddress: item.ipAddress,
        userAgent: item.userAgent,
      })),
      actions: AUDIT_ACTIONS,
      entityTypes: entityTypeRows.map((row) => row.entityType).filter(Boolean),
    }
  }

  private resolveRequestId() {
    return (
      (this.ctx as HttpContext & { requestId?: string }).requestId ??
      this.ctx.request.header('x-request-id') ??
      null
    )
  }

  private resolveIpAddress() {
    return (
      this.ctx.request.header('x-forwarded-for')?.split(',')[0]?.trim() || this.ctx.request.ip()
    )
  }
}

interface LogAuditEntryInput {
  action: AuditAction
  entityType: string
  entityId: string
  description?: string | null
  changes?: Record<string, unknown> | null
  tenantId?: string | null
  userId?: string | null
}

interface CreateAuditEntryInput extends Omit<LogAuditEntryInput, 'action' | 'changes'> {
  after?: Record<string, unknown> | null
}

interface UpdateAuditEntryInput extends Omit<LogAuditEntryInput, 'action' | 'changes'> {
  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
}

interface DeleteAuditEntryInput extends Omit<LogAuditEntryInput, 'action' | 'changes'> {
  before?: Record<string, unknown> | null
}

interface ListAuditLogsInput {
  dateFrom?: string
  dateTo?: string
  userId?: string
  tenantId?: string
  action?: AuditAction
  entityType?: string
  entityId?: string
}

const AUDIT_ACTIONS: AuditAction[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'ARCHIVE',
  'RESTORE',
  'MERGE',
  'IMPORT',
  'DUPLICATE',
]

function startOfDay(value: string) {
  return DateTime.fromISO(value).startOf('day').toSQL({ includeOffset: false })!
}

function endOfDay(value: string) {
  return DateTime.fromISO(value).endOf('day').toSQL({ includeOffset: false })!
}

function toIsoDateTime(value: string | Date | null) {
  if (!value) {
    return DateTime.utc().toISO()!
  }

  return DateTime.fromJSDate(new Date(value)).toISO()!
}
