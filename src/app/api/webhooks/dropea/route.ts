import { NextRequest, NextResponse } from 'next/server'
import { verifyDropeaSignature } from '@/lib/webhooks/verify'
import { idempotencyStore } from '@/lib/webhooks/idempotency'
import { getOrderTracking } from '@/lib/dropea/orders'
import { sendTrackingEmail, inferLocaleFromZip } from '@/lib/email/tracking-email'

interface DropeaWebhookPayload {
  event: string
  event_id: string
  data: Record<string, unknown>
}

const TRACKING_EMAIL_SENT_PREFIX = 'tracking-email-sent:'

/**
 * Manda el mail de seguimiento la primera vez que la orden tiene
 * tracking_code/tracking_url asignados. No conocemos el nombre exacto del
 * campo `event` que manda Dropea (el webhook nunca se registró hasta ahora,
 * ver callbackCreate) — por eso no filtramos por event, revisamos cualquier
 * payload que traiga un order_id y dejamos que el tracking real decida si
 * corresponde mandar el mail o no.
 */
async function maybeSendTrackingEmail(orderId: number): Promise<void> {
  const dedupeKey = `${TRACKING_EMAIL_SENT_PREFIX}${orderId}`
  if (await idempotencyStore.isProcessed(dedupeKey)) return

  const order = await getOrderTracking(orderId)
  if (!order) return

  // Las 3 tiendas Bamzuk comparten la MISMA cuenta de Dropea — callbackCreate
  // no tiene parámetro de shop, así que este webhook recibe eventos de las
  // 3. Si el pedido no es de ESTA tienda, ignorarlo (si no, cada tienda le
  // manda el mail al cliente de las otras dos también).
  const ownShopId = process.env.DROPEA_SHOP_ID
  if (ownShopId && order.shopId !== ownShopId) return

  if (!order.trackingCode || !order.trackingUrl || !order.customerEmail) return

  await sendTrackingEmail({
    to: order.customerEmail,
    customerName: order.customerName,
    orderId: order.id,
    trackingCode: order.trackingCode,
    trackingUrl: order.trackingUrl,
    carrierCompany: order.carrierCompany,
    locale: inferLocaleFromZip(order.customerZip),
  })

  // TTL largo (30 días) — el estado de un pedido puede seguir cambiando
  // (TRANSIT, DELIVERED...) mucho después de asignado el tracking, y no
  // queremos volver a mandar el mail en cada una de esas actualizaciones.
  await idempotencyStore.markProcessed(dedupeKey, 30 * 24 * 3600)
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

  const orderId = Number(data['order_id'])
  if (Number.isFinite(orderId) && orderId > 0) {
    console.info(`[dropea-webhook] event=${event} order_id=${orderId}`)
    try {
      await maybeSendTrackingEmail(orderId)
    } catch (err) {
      // No relanzamos: un mail fallido no debería hacer que Dropea reintente
      // la entrega del webhook entero.
      console.error(
        '[dropea-webhook] tracking email failed:',
        err instanceof Error ? err.message : err,
      )
    }
  }

  await idempotencyStore.markProcessed(eventId)
  return NextResponse.json({ ok: true })
}
