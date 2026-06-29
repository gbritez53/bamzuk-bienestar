'use server'

import { randomUUID } from 'crypto'
import { getDropeaClient } from '@/lib/dropea/client'
import { CREATE_ORDER_MUTATION } from '@/lib/dropea/mutations/orders'
import type { CartItem, Address } from '@/lib/contracts'

const SUMUP_API = 'https://api.sumup.com'

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Devuelve las credenciales de SumUp según el modo (sandbox o producción).
 * Si SUMUP_SANDBOX=true, usa las claves con prefijo SUMUP_SANDBOX_.
 * Si no, usa las claves normales SUMUP_API_KEY / SUMUP_MERCHANT_CODE.
 */
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
}

export async function createDropeaOrder(
  input: CreateOrderInput,
): Promise<{ orderId: string }> {
  const shopId = process.env.DROPEA_SHOP_ID
  if (!shopId) {
    // DROPEA_SHOP_ID not set yet — shop will be created after Vercel deploy
    console.warn(
      '[createDropeaOrder] DROPEA_SHOP_ID not set — order not created in Dropea',
    )
    return { orderId: `local-${randomUUID()}` }
  }

  const client = getDropeaClient()
  // OrderCreateInput fields TBD after shop creation — explore via Dropea API
  // For now we send known fields; the API will return errors for unknowns
  const data = await client.request<{ orderCreate: { id: string } }>(
    CREATE_ORDER_MUTATION,
    {
      input: {
        shop_id: parseInt(shopId, 10),
        notes: `SumUp checkout: ${input.sumupCheckoutId}`,
        // items and address will be added once schema is confirmed
      },
    },
  )
  return { orderId: data.orderCreate.id }
}

// ── Helper ─────────────────────────────────────────────────────────────────

export async function generateOrderReference(): Promise<string> {
  return `ORDER-${randomUUID().slice(0, 8).toUpperCase()}`
}
