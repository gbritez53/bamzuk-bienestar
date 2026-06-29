import { createHmac } from 'crypto'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.stubEnv('DROPEA_WEBHOOK_SECRET', 'test-secret')

// Resetear el módulo de idempotency entre tests para evitar contaminación
vi.mock('@/lib/webhooks/idempotency', () => {
  const store = { isProcessed: vi.fn(async () => false), markProcessed: vi.fn(async () => {}) }
  return { idempotencyStore: store, InMemoryIdempotencyStore: vi.fn(() => store) }
})

function makeRequest(body: object, secret: string): NextRequest {
  const payload = JSON.stringify(body)
  const sig = 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex')
  return new NextRequest('http://localhost/api/webhooks/dropea', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-dropea-signature': sig },
    body: payload,
  })
}

describe('POST /api/webhooks/dropea', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 200 con evento válido', async () => {
    const { POST } = await import('../route')
    const req = makeRequest({ event: 'order.status_changed', event_id: 'evt-1', data: { order_id: '123', status: 'shipped' } }, 'test-secret')
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('retorna 401 con firma inválida', async () => {
    const { POST } = await import('../route')
    const req = new NextRequest('http://localhost/api/webhooks/dropea', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-dropea-signature': 'sha256=bad' },
      body: JSON.stringify({ event: 'test', event_id: 'evt-2' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('retorna 200 inmediatamente para eventos ya procesados (idempotencia)', async () => {
    const { idempotencyStore } = await import('@/lib/webhooks/idempotency')
    vi.mocked(idempotencyStore.isProcessed).mockResolvedValueOnce(true)
    const { POST } = await import('../route')
    const req = makeRequest({ event: 'order.status_changed', event_id: 'evt-dup', data: {} }, 'test-secret')
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(idempotencyStore.markProcessed).not.toHaveBeenCalledWith('evt-dup', expect.anything())
  })
})
