// In-memory: resets on cold start. Replace with Redis/KV in production.
export interface IdempotencyStore {
  isProcessed(eventId: string): Promise<boolean>
  markProcessed(eventId: string, ttlSec?: number): Promise<void>
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly processed = new Map<string, number>() // eventId → expiresAt ms

  async isProcessed(eventId: string): Promise<boolean> {
    const expiresAt = this.processed.get(eventId)
    if (expiresAt === undefined) return false
    if (Date.now() > expiresAt) {
      this.processed.delete(eventId)
      return false
    }
    return true
  }

  async markProcessed(eventId: string, ttlSec = 86400): Promise<void> {
    this.processed.set(eventId, Date.now() + ttlSec * 1000)
  }
}

// Singleton para el runtime de Next.js
export const idempotencyStore: IdempotencyStore = new InMemoryIdempotencyStore()
