import { NextRequest, NextResponse } from 'next/server'
import { verifySumUpSignature } from '@/lib/webhooks/verify'
import { idempotencyStore } from '@/lib/webhooks/idempotency'

interface SumUpWebhookPayload {
  event_type: string
  id: string
  payload: {
    checkout_id?: string
    status?: string
    reference?: string
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text()
  const signature = request.headers.get('x-payload-signature') ?? ''
  const secret = process.env.SUMUP_WEBHOOK_SECRET ?? ''

  if (!secret || !verifySumUpSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: SumUpWebhookPayload
  try {
    payload = JSON.parse(rawBody) as SumUpWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventId = payload.id

  if (await idempotencyStore.isProcessed(eventId)) {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  if (payload.event_type === 'PAYMENT' && payload.payload.status === 'PAID') {
    const checkoutId = payload.payload.checkout_id ?? ''
    const reference = payload.payload.reference ?? ''
    // Future: trigger Dropea order creation once cart items are persisted server-side
    console.info(`[sumup-webhook] payment confirmed — checkout: ${checkoutId}, ref: ${reference}`)
  }

  await idempotencyStore.markProcessed(eventId)
  return NextResponse.json({ ok: true })
}
