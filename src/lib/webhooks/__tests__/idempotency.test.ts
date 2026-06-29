import { describe, it, expect, beforeEach } from 'vitest'

describe('InMemoryIdempotencyStore', () => {
  let store: import('../idempotency').IdempotencyStore

  beforeEach(async () => {
    // Importar la clase directamente para tener una instancia fresca en cada test
    const mod = await import('../idempotency')
    store = new mod.InMemoryIdempotencyStore()
  })

  it('evento nuevo no está procesado', async () => {
    expect(await store.isProcessed('evt-1')).toBe(false)
  })

  it('después de markProcessed, isProcessed retorna true', async () => {
    await store.markProcessed('evt-1')
    expect(await store.isProcessed('evt-1')).toBe(true)
  })

  it('distintos eventIds son independientes', async () => {
    await store.markProcessed('evt-1')
    expect(await store.isProcessed('evt-2')).toBe(false)
  })

  it('evento expirado retorna false', async () => {
    await store.markProcessed('evt-1', 0) // TTL de 0 segundos → expira inmediatamente
    // Pequeño delay para que el tiempo avance
    await new Promise(r => setTimeout(r, 10))
    expect(await store.isProcessed('evt-1')).toBe(false)
  })
})
