import dns from 'node:dns/promises'
import { isIP } from 'node:net'

export default class RemoteUrlGuardService {
  private isPrivateIp(ip: string): boolean {
    if (ip.includes('.')) {
      const parts = ip.split('.').map(Number)
      if (parts.length !== 4 || parts.some(Number.isNaN)) return true

      if (parts[0] === 127) return true // Loopback
      if (parts[0] === 10) return true // Private
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true // Private
      if (parts[0] === 192 && parts[1] === 168) return true // Private
      if (parts[0] === 169 && parts[1] === 254) return true // Link-local
      if (parts[0] === 0 && parts[1] === 0 && parts[2] === 0 && parts[3] === 0) return true // Unspecified

      return false
    }

    if (ip.includes(':')) {
      const normalized = ip.toLowerCase()
      if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true // Loopback
      if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true // Unspecified
      if (normalized.startsWith('fe80:')) return true // Link-local
      if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true // Unique Local
      if (normalized.startsWith('ff')) return true // Multicast

      return false
    }

    return true
  }

  async validate(urlStr: string): Promise<void> {
    let parsedUrl: URL
    try {
      parsedUrl = new URL(urlStr)
    } catch {
      throw new Error('Invalid URL')
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('Invalid protocol. Only HTTP and HTTPS are allowed.')
    }

    const hostname = parsedUrl.hostname

    if (isIP(hostname)) {
      if (this.isPrivateIp(hostname)) {
        throw new Error('Access to private/local IP addresses is not allowed.')
      }

      return
    }

    try {
      const addresses = await dns.lookup(hostname, { all: true })
      for (const addr of addresses) {
        if (this.isPrivateIp(addr.address)) {
          throw new Error('SSRF attempt blocked: Host resolves to private/local IP address.')
        }
      }
    } catch {
      throw new Error(`SSRF validation failed: Unable to resolve hostname ${hostname}`)
    }
  }
}
