import { NextRequest, NextResponse } from 'next/server'
import { verifySumUpSignature } from '@/lib/webhooks/verify'
import { idempotencyStore } from '@/lib/webhooks/idempotency'
import { checkoutStore } from '@/lib/webhooks/checkout-store'
import { createDropeaOrder } from '@/app/[locale]/checkout/actions'

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

    // Intentar recuperar payload guardado
    const savedPayload = reference ? await checkoutStore.get(reference) : null

    if (savedPayload) {
      try {
        const result = await createDropeaOrder({
          items: savedPayload.items,
          customer: savedPayload.customer,
          locale: savedPayload.locale,
          sumupCheckoutId: checkoutId,
          reference,
        })
        console.info(
          `[sumup-webhook] order created — checkout: ${checkoutId}, order: ${result.orderId}`,
        )
        await checkoutStore.delete(reference)
      } catch (err) {
        console.error(
          `[sumup-webhook] failed to create order — checkout: ${checkoutId}, ref: ${reference}`,
          err,
        )
      }
    } else {
      // Puede que el payload se haya perdido (cold start) o que se haya
      // procesado ya via confirmacion page
      console.info(
        `[sumup-webhook] payment confirmed but no payload found — checkout: ${checkoutId}, ref: ${reference}`,
      )
    }
  }

  await idempotencyStore.markProcessed(eventId)
  return NextResponse.json({ ok: true })
}
