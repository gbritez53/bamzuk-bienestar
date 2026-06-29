'use server'

import { randomUUID } from 'crypto'
import { getDropeaClient } from '@/lib/dropea/client'
import { CREATE_ORDER_MUTATION } from '@/lib/dropea/mutations/orders'
import { checkoutStore, type CheckoutPayload } from '@/lib/webhooks/checkout-store'
import type { CartItem, Address } from '@/lib/contracts'

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
  customer: { name: string; email: string; address: Address }
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

export interface CreateOrderInput {
  items: CartItem[]
  customer: { name: string; email: string; address: Address }
  locale: string
  sumupCheckoutId: string
  reference: string
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

  // Intentar con todos los datos; si Dropea rechaza campos, caemos a básico
  const fullInput = {
    shop_id: parseInt(shopId, 10),
    notes: `SumUp: ${input.sumupCheckoutId} | Ref: ${input.reference}`,
    items: input.items.map(item => ({
      product_id: parseInt(item.productId, 10),
      variant_id: item.variantId ? parseInt(item.variantId, 10) : null,
      quantity: item.quantity,
      price: item.unitBasePrice / 100,
    })),
    shipping: {
      name: input.customer.name,
      email: input.customer.email,
      address: input.customer.address.line,
      city: input.customer.address.city,
      postal_code: input.customer.address.postalCode,
      country: input.customer.address.country,
    },
  }

  try {
    const data = await client.request<{ orderCreate: { id: string } }>(
      CREATE_ORDER_MUTATION,
      { input: fullInput },
    )
    return { orderId: data.orderCreate.id }
  } catch {
    // Fallback: algunos campos pueden no existir en el schema de Dropea
    // Enviamos solo shop_id + notas (lo mínimo que funciona)
    const data = await client.request<{ orderCreate: { id: string } }>(
      CREATE_ORDER_MUTATION,
      {
        input: {
          shop_id: parseInt(shopId, 10),
          notes: `SumUp: ${input.sumupCheckoutId} | Ref: ${input.reference} | Cliente: ${input.customer.name}`,
        },
      },
    )
    return { orderId: data.orderCreate.id }
  }
}

// ── Helper ─────────────────────────────────────────────────────────────────

export async function generateOrderReference(): Promise<string> {
  return `ORDER-${randomUUID().slice(0, 8).toUpperCase()}`
}
