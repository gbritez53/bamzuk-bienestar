// src/lib/email/order-notifications.ts
// Orquestador PURO (no 'use server') de las notificaciones por email de un
// pedido nuevo. Reusable tanto por el Server Component de confirmación
// (tarjeta, import directo) como por el server action de CheckoutForm (COD).
// Nunca lanza: aísla el envío de mails de la creación de la orden en Dropea
// (constraint del proposal — un fallo de Resend NUNCA debe afectar un
// checkout ya exitoso).

import type { CartItem, CheckoutCustomer } from '@/lib/contracts'
import { sendOrderConfirmationEmail } from './order-confirmation-email'
import { sendOwnerNewOrderEmail } from './owner-new-order-email'
import { idempotencyStore } from '@/lib/webhooks/idempotency'

const NOTIFICATIONS_TTL_SEC = 7 * 24 * 3600 // 7 días

export interface OrderPlacedNotification {
  orderId: string
  reference: string
  locale: 'es' | 'pt'
  customer: CheckoutCustomer
  items: CartItem[]
  paymentMethod: 'PAID' | 'CASH_ON_DELIVERY'
  subtotalCents: number
  shippingEur: number
}

async function maybeSendOwnerEmail(input: OrderPlacedNotification): Promise<void> {
  const to = process.env.OWNER_NOTIFICATION_EMAIL
  if (!to) {
    console.warn(
      '[order-notifications] OWNER_NOTIFICATION_EMAIL not set — skipping owner notification',
    )
    return
  }

  await sendOwnerNewOrderEmail({
    to,
    orderId: input.orderId,
    reference: input.reference,
    customer: input.customer,
    items: input.items,
    subtotalCents: input.subtotalCents,
    shippingEur: input.shippingEur,
    paymentMethod: input.paymentMethod,
  })
}

export async function notifyOrderPlaced(input: OrderPlacedNotification): Promise<void> {
  const dedupeKey = `order-notifications-sent:${input.orderId}`

  if (await idempotencyStore.isProcessed(dedupeKey)) {
    return
  }

  const results = await Promise.allSettled([
    sendOrderConfirmationEmail({
      to: input.customer.email,
      customerName: input.customer.firstName,
      orderId: input.orderId,
      items: input.items,
      subtotalCents: input.subtotalCents,
      shippingEur: input.shippingEur,
      paymentMethod: input.paymentMethod,
      locale: input.locale,
    }),
    maybeSendOwnerEmail(input),
  ])

  results.forEach(result => {
    if (result.status === 'rejected') {
      console.error('[order-notifications]', result.reason)
    }
  })

  // Se marca SIEMPRE tras el intento (incluso si un mail falló). La
  // idempotencia acá previene doble-envío por doble-carga de la página de
  // confirmación, no implementa retry (out-of-scope en Fase 1).
  await idempotencyStore.markProcessed(dedupeKey, NOTIFICATIONS_TTL_SEC)
}
