// Almacén temporal para payloads de checkout antes de redirigir a SumUp.
// In-memory: resetea en cold start. Reemplazar con Redis/KV en producción.

import type { CartItem, Address } from '@/lib/contracts'

export interface CheckoutPayload {
  items: CartItem[]
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: Address
  }
  locale: string
  subtotalCents: number
  shippingEur: number
  totalEur: number
  createdAt: string // ISO
}

export interface CheckoutStore {
  save(reference: string, payload: CheckoutPayload): Promise<void>
  get(reference: string): Promise<CheckoutPayload | null>
  delete(reference: string): Promise<void>
}

export class InMemoryCheckoutStore implements CheckoutStore {
  private readonly store = new Map<string, CheckoutPayload>()

  async save(reference: string, payload: CheckoutPayload): Promise<void> {
    this.store.set(reference, payload)
  }

  async get(reference: string): Promise<CheckoutPayload | null> {
    return this.store.get(reference) ?? null
  }

  async delete(reference: string): Promise<void> {
    this.store.delete(reference)
  }
}

// Singleton para el runtime de Next.js
export const checkoutStore: CheckoutStore = new InMemoryCheckoutStore()
