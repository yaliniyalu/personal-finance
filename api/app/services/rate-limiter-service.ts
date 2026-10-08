import { DateTime } from 'luxon'

interface LimitEntry {
  attempts: number
  blockExpiry: DateTime | null
}

export default class RateLimiterService {
  private static store = new Map<string, LimitEntry>()

  public static async check(key: string) {
    const entry = this.store.get(key)
    if (!entry) {
      return
    }

    if (entry.blockExpiry && entry.blockExpiry > DateTime.now()) {
      const minutesLeft = Math.ceil(entry.blockExpiry.diff(DateTime.now(), 'minutes').minutes)
      throw new Error(`Too many login attempts. Please try again after ${minutesLeft} minute(s).`)
    }

    // If block expired, reset
    if (entry.blockExpiry && entry.blockExpiry <= DateTime.now()) {
      this.store.delete(key)
    }
  }

  public static async hit(key: string, maxAttempts: number = 5, blockMinutes: number = 15) {
    let entry = this.store.get(key)
    if (!entry) {
      entry = { attempts: 0, blockExpiry: null }
    }

    entry.attempts += 1
    if (entry.attempts >= maxAttempts) {
      entry.blockExpiry = DateTime.now().plus({ minutes: blockMinutes })
    }

    this.store.set(key, entry)
  }

  public static async reset(key: string) {
    this.store.delete(key)
  }
}
