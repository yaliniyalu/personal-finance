import Tenant from '#models/tenant'
import { tenantUrl } from '#helpers/utils'

export default class TenantCtx {
  public readonly id: string
  public readonly name: string
  public readonly email: string | null
  public readonly username: string
  public readonly organizationType: string
  public readonly contactName: string
  public readonly mobileNumber: string
  public readonly countryCode: string | null
  public readonly status: string

  get url() {
    return tenantUrl(this.tenant.username)
  }

  constructor(private readonly tenant: Tenant) {
    this.id = tenant.id
    this.name = tenant.name
    this.email = tenant.email
    this.username = tenant.username
    this.organizationType = tenant.organizationType
    this.contactName = tenant.contactName
    this.mobileNumber = tenant.mobileNumber
    this.countryCode = tenant.countryCode
    this.status = tenant.status
  }

  static async fromId(id: string) {
    const tenant = await Tenant.findOrFail(id)
    return new TenantCtx(tenant)
  }

  static async fromDoc(tenant: Tenant) {
    return new TenantCtx(tenant)
  }

  getDoc() {
    return this.tenant
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      username: this.username,
      url: this.url,
      organizationType: this.organizationType,
      contactName: this.contactName,
      mobileNumber: this.mobileNumber,
      countryCode: this.countryCode,
      status: this.status,
    }
  }
}
