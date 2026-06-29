import { NextRequest, NextResponse } from 'next/server'
import { verifyDropeaSignature } from '@/lib/webhooks/verify'
import { idempotencyStore } from '@/lib/webhooks/idempotency'

interface DropeaWebhookPayload {
  event: string
  event_id: string
  data: Record<string, unknown>
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text()
  const signature = request.headers.get('x-dropea-signature') ?? ''
  const secret = process.env.DROPEA_WEBHOOK_SECRET ?? ''

  if (!secret || !verifyDropeaSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: DropeaWebhookPayload
  try {
    payload = JSON.parse(rawBody) as DropeaWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event_id: eventId, event, data } = payload

  if (await idempotencyStore.isProcessed(eventId)) {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  // Handle event types
  if (event === 'order.status_changed') {
    const orderId = String(data['order_id'] ?? '')
    const status = String(data['status'] ?? '')
    // Future: update order in DB / send notification
    console.info(`[dropea-webhook] order ${orderId} → ${status}`)
  }

  await idempotencyStore.markProcessed(eventId)
  return NextResponse.json({ ok: true })
}
