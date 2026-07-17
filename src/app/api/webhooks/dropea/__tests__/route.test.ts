import { createHmac } from 'crypto'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.stubEnv('DROPEA_WEBHOOK_SECRET', 'test-secret')
vi.stubEnv('DROPEA_SHOP_ID', '17817')

// Resetear el módulo de idempotency entre tests para evitar contaminación
vi.mock('@/lib/webhooks/idempotency', () => {
  const store = { isProcessed: vi.fn(async () => false), markProcessed: vi.fn(async () => {}) }
  return { idempotencyStore: store, InMemoryIdempotencyStore: vi.fn(() => store) }
})

vi.mock('@/lib/dropea/orders', () => ({
  getOrderTracking: vi.fn(),
}))

vi.mock('@/lib/email/tracking-email', () => ({
  sendTrackingEmail: vi.fn(async () => {}),
  inferLocaleFromZip: (zip: string | null) => (zip?.includes('-') ? 'pt' : 'es'),
}))

const orderWithTracking = {
  id: '123',
  status: 'PREPARED',
  trackingCode: '0280010280017024587071',
  trackingUrl: 'https://dinapaqweb.tipsa-dinapaq.com/dinapaqweb/detalle_envio.php?servicio=xxx',
  carrierCompany: '#1 - tipsa',
  shopId: '17817',
  customerEmail: 'cliente@test.com',
  customerName: 'Juan Test',
  customerZip: '28001',
}

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

  it('manda el mail de tracking cuando la orden ya tiene tracking_code/tracking_url', async () => {
    const { getOrderTracking } = await import('@/lib/dropea/orders')
    const { sendTrackingEmail } = await import('@/lib/email/tracking-email')
    vi.mocked(getOrderTracking).mockResolvedValue(orderWithTracking)

    const { POST } = await import('../route')
    const req = makeRequest(
      { event: 'order.status_changed', event_id: 'evt-3', data: { order_id: 123, status: 'PREPARED' } },
      'test-secret',
    )
    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(sendTrackingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'cliente@test.com',
        trackingCode: orderWithTracking.trackingCode,
        trackingUrl: orderWithTracking.trackingUrl,
        locale: 'es',
      }),
    )
  })

  it('no manda el mail si la orden todavía no tiene tracking asignado', async () => {
    const { getOrderTracking } = await import('@/lib/dropea/orders')
    const { sendTrackingEmail } = await import('@/lib/email/tracking-email')
    vi.mocked(getOrderTracking).mockResolvedValue({
      ...orderWithTracking,
      trackingCode: null,
      trackingUrl: null,
    })

    const { POST } = await import('../route')
    const req = makeRequest(
      { event: 'order.status_changed', event_id: 'evt-4', data: { order_id: 123, status: 'CONFIRMED' } },
      'test-secret',
    )
    await POST(req)

    expect(sendTrackingEmail).not.toHaveBeenCalled()
  })

  it('no vuelve a mandar el mail si ya se mandó antes para esa orden', async () => {
    const { idempotencyStore } = await import('@/lib/webhooks/idempotency')
    const { sendTrackingEmail } = await import('@/lib/email/tracking-email')
    vi.mocked(idempotencyStore.isProcessed).mockImplementation(
      async (key: string) => key === 'tracking-email-sent:123',
    )

    const { POST } = await import('../route')
    const req = makeRequest(
      { event: 'order.status_changed', event_id: 'evt-5', data: { order_id: 123, status: 'TRANSIT' } },
      'test-secret',
    )
    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(sendTrackingEmail).not.toHaveBeenCalled()
  })

  it('ignora el pedido si es de OTRA tienda (mismo webhook recibe eventos de las 3 tiendas Bamzuk)', async () => {
    const { getOrderTracking } = await import('@/lib/dropea/orders')
    const { sendTrackingEmail } = await import('@/lib/email/tracking-email')
    vi.mocked(getOrderTracking).mockResolvedValue({ ...orderWithTracking, id: '456', shopId: '17593' }) // electronica, no bienestar

    const { POST } = await import('../route')
    const req = makeRequest(
      { event: 'order.status_changed', event_id: 'evt-7', data: { order_id: 456, status: 'PREPARED' } },
      'test-secret',
    )
    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(sendTrackingEmail).not.toHaveBeenCalled()
  })

  it('si DROPEA_SHOP_ID no está configurado, no filtra (fail-open) y manda el mail igual', async () => {
    vi.stubEnv('DROPEA_SHOP_ID', '')
    const { getOrderTracking } = await import('@/lib/dropea/orders')
    const { sendTrackingEmail } = await import('@/lib/email/tracking-email')
    vi.mocked(getOrderTracking).mockResolvedValue({ ...orderWithTracking, id: '789', shopId: '17593' })

    const { POST } = await import('../route')
    const req = makeRequest(
      { event: 'order.status_changed', event_id: 'evt-8', data: { order_id: 789, status: 'PREPARED' } },
      'test-secret',
    )
    await POST(req)

    expect(sendTrackingEmail).toHaveBeenCalled()
    vi.stubEnv('DROPEA_SHOP_ID', '17817')
  })

  it('no rompe el webhook si el envío del mail falla', async () => {
    const { getOrderTracking } = await import('@/lib/dropea/orders')
    const { sendTrackingEmail } = await import('@/lib/email/tracking-email')
    vi.mocked(getOrderTracking).mockResolvedValue(orderWithTracking)
    vi.mocked(sendTrackingEmail).mockRejectedValue(new Error('Resend caído'))

    const { POST } = await import('../route')
    const req = makeRequest(
      { event: 'order.status_changed', event_id: 'evt-6', data: { order_id: 123, status: 'PREPARED' } },
      'test-secret',
    )
    const res = await POST(req)

    expect(res.status).toBe(200)
  })
})
