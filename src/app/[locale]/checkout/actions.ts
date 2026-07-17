'use server'

import { randomUUID } from 'crypto'
import { getDropeaClient } from '@/lib/dropea/client'
import { CREATE_ORDER_MUTATION } from '@/lib/dropea/mutations/orders'
import { checkoutStore, type CheckoutPayload } from '@/lib/webhooks/checkout-store'
import type { CartItem, CheckoutCustomer } from '@/lib/contracts'
import { notifyOrderPlaced, type OrderPlacedNotification } from '@/lib/email/order-notifications'

const SUMUP_API = 'https://api.sumup.com'

// ── Helpers ─────────────────────────────────────────────────────────────────

function getSumupCredentials(): { apiKey: string; merchantCode: string } {
  const isSandbox = process.env.SUMUP_SANDBOX === 'true'

  const apiKey = isSandbox
    ? process.env.SUMUP_SANDBOX_API_KEY
    : process.env.SUMUP_API_KEY

  const merchantCode = isSandbox
    ? process.env.SUMUP_SANDBOX_MERCHANT_CODE
    : process.env.SUMUP_MERCHANT_CODE

  if (!apiKey || !merchantCode) {
    const mode = isSandbox ? 'sandbox' : 'production'
    throw new Error(`SumUp ${mode} credentials not configured`)
  }

  return { apiKey, merchantCode }
}

// ── Save checkout payload (antes de redirigir a SumUp) ─────────────────────

export interface SaveCheckoutPayloadInput {
  reference: string
  items: CartItem[]
  customer: CheckoutCustomer
  locale: string
  subtotalCents: number
  shippingEur: number
}

export async function saveCheckoutPayload(
  input: SaveCheckoutPayloadInput,
): Promise<void> {
  const payload: CheckoutPayload = {
    items: input.items,
    customer: input.customer,
    locale: input.locale,
    subtotalCents: input.subtotalCents,
    shippingEur: input.shippingEur,
    totalEur: Math.round((input.subtotalCents / 100 + input.shippingEur) * 100),
    createdAt: new Date().toISOString(),
  }
  await checkoutStore.save(input.reference, payload)
}

// ── SumUp ─────────────────────────────────────────────────────────────────

export interface CreateCheckoutInput {
  amountEur: number
  reference: string
  description: string
  returnUrl: string
}

export async function createSumUpCheckout(
  input: CreateCheckoutInput,
): Promise<{ checkoutId: string }> {
  const { apiKey, merchantCode } = getSumupCredentials()

  const res = await fetch(`${SUMUP_API}/v0.1/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      checkout_reference: input.reference,
      amount: input.amountEur,
      currency: 'EUR',
      pay_to_email: merchantCode,
      return_url: input.returnUrl,
      description: input.description,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`SumUp error ${res.status}: ${JSON.stringify(body)}`)
  }

  const data = (await res.json()) as { id: string }
  return { checkoutId: data.id }
}

export async function verifySumUpPayment(
  checkoutId: string,
): Promise<{ status: string }> {
  const { apiKey } = getSumupCredentials()

  const res = await fetch(`${SUMUP_API}/v0.1/checkouts/${checkoutId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`SumUp verify error ${res.status}`)
  const data = (await res.json()) as { status: string }
  return { status: data.status }
}

// ── Dropea order ───────────────────────────────────────────────────────────

// PAID debita el costo de la wallet de Dropea (requiere saldo) — se usa
// cuando el cliente ya pagó con tarjeta via SumUp. CASH_ON_DELIVERY crea
// el pedido sin exigir saldo — el cliente paga al recibir.
export type DropeaPaymentMethod = 'PAID' | 'CASH_ON_DELIVERY'

export interface CreateOrderInput {
  items: CartItem[]
  customer: CheckoutCustomer
  locale: string
  reference: string
  paymentMethod: DropeaPaymentMethod
  sumupCheckoutId?: string
  // Envío a sumar al primer producto declarado a Dropea. Solo aplica a
  // CASH_ON_DELIVERY: orderCreate no tiene un campo de envío propio, así que
  // el repartidor cobra en la puerta la suma de los productos declarados —
  // sin esto el envío nunca se cobra y lo termina pagando el dropshipper
  // (detectado con un pedido de prueba real: "Coste de envío estimado"
  // aparecía como gasto neto, no como algo cobrado al cliente).
  shippingEur?: number
}

export async function createDropeaOrder(
  input: CreateOrderInput,
): Promise<{ orderId: string }> {
  const shopId = process.env.DROPEA_SHOP_ID
  if (!shopId) {
    console.warn(
      '[createDropeaOrder] DROPEA_SHOP_ID not set — order not created in Dropea',
    )
    return { orderId: `local-${randomUUID()}` }
  }

  const client = getDropeaClient()

  const products = input.items.map(item => {
    const unitPriceEur = item.unitBasePrice / 100
    return {
      product_id: parseInt(item.productId, 10),
      unit_price: unitPriceEur,
      quantity: item.quantity,
      total_value: Math.round(unitPriceEur * item.quantity * 100) / 100,
    }
  })

  // Contrareembolso: sumamos el envío al primer producto para que el monto
  // que cobra el repartidor en la puerta coincida con lo que se le mostró
  // al cliente en el checkout (subtotal + envío).
  if (input.paymentMethod === 'CASH_ON_DELIVERY' && input.shippingEur && products[0]) {
    const first = products[0]
    first.total_value = Math.round((first.total_value + input.shippingEur) * 100) / 100
    first.unit_price = Math.round((first.total_value / first.quantity) * 100) / 100
  }

  const variables = {
    shop_id: parseInt(shopId, 10),
    payment_method: input.paymentMethod,
    external_order_name: input.reference,
    customer: {
      first_name: input.customer.firstName,
      last_name: input.customer.lastName,
      email: input.customer.email,
      phone: input.customer.phone,
      address: input.customer.address.line,
      city: input.customer.address.city,
      zip: input.customer.address.postalCode,
      country: input.customer.address.country,
    },
    products,
  }

  const data = await client.request<{
    orderCreate: { id: string; status: string; total_amount: number }
  }>(CREATE_ORDER_MUTATION, variables)

  if (input.sumupCheckoutId) {
    console.info(
      `[createDropeaOrder] order ${data.orderCreate.id} created — SumUp checkout: ${input.sumupCheckoutId}`,
    )
  }

  return { orderId: data.orderCreate.id }
}

// ── Contrareembolso (COD) ───────────────────────────────────────────────────

export interface CreateCodOrderInput {
  items: CartItem[]
  customer: CheckoutCustomer
  locale: string
  // Ver comentario en CreateOrderInput.shippingEur — mismo fix: el envío se
  // suma al primer producto declarado para que el repartidor lo cobre.
  shippingEur?: number
}

/**
 * Flujo contrareembolso: no pasa por SumUp — crea la orden en Dropea
 * directamente con CASH_ON_DELIVERY (no exige saldo en la wallet).
 */
export async function createCodOrder(
  input: CreateCodOrderInput,
): Promise<{ orderId: string; reference: string }> {
  const reference = await generateOrderReference()
  const { orderId } = await createDropeaOrder({
    items: input.items,
    customer: input.customer,
    locale: input.locale,
    reference,
    paymentMethod: 'CASH_ON_DELIVERY',
    shippingEur: input.shippingEur,
  })
  return { orderId, reference }
}

// ── Helper ─────────────────────────────────────────────────────────────────

export async function generateOrderReference(): Promise<string> {
  return `ORDER-${randomUUID().slice(0, 8).toUpperCase()}`
}

// ── Notificaciones por email ─────────────────────────────────────────────
// CheckoutForm.tsx es 'use client' y no puede importar módulos de email
// (RESEND_API_KEY es server-only). Este server action es un pasamanos hacia
// el orquestador puro — notifyOrderPlaced ya traga errores, así que esto es
// solo el puente client → server.

export async function notifyOrderPlacedAction(input: OrderPlacedNotification): Promise<void> {
  await notifyOrderPlaced(input)
}
