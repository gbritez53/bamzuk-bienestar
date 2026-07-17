// src/lib/email/owner-new-order-email.ts
// Mail de aviso al DUEÑO por pedido nuevo — ES-only (destinatario único
// hispanohablante, tono operativo). Se dispara para ambos métodos de pago
// (tarjeta y COD) desde el mismo punto que el mail al cliente.

import type { CartItem, CheckoutCustomer } from '@/lib/contracts'
import { getResendClient } from './resend'
import { renderEmailShell, renderLineItems, formatEurCents } from './shell'

export interface OwnerNewOrderEmailInput {
  to: string
  orderId: string
  reference: string
  customer: CheckoutCustomer
  items: CartItem[]
  subtotalCents: number
  shippingEur: number
  paymentMethod: 'PAID' | 'CASH_ON_DELIVERY'
}

function buildSubject(input: OwnerNewOrderEmailInput): string {
  return `Nuevo pedido — ${input.orderId}`
}

function buildHtml(input: OwnerNewOrderEmailInput): string {
  const { orderId, reference, customer, items, subtotalCents, shippingEur, paymentMethod } = input
  const shippingCents = Math.round(shippingEur * 100)
  const totalCents = subtotalCents + shippingCents

  return renderEmailShell(`
    <h1 style="font-size: 20px; margin-bottom: 8px;">Nuevo pedido</h1>

    <div style="border: 1px solid #e2e8f0; padding: 16px; margin: 20px 0;">
      <p style="font-size: 12px; color: #45464d; margin: 0 0 4px;">Pedido (Dropea)</p>
      <p style="font-size: 14px; font-weight: 600; margin: 0 0 12px;">${orderId}</p>

      <p style="font-size: 12px; color: #45464d; margin: 0 0 4px;">Referencia</p>
      <p style="font-size: 14px; font-weight: 600; margin: 0 0 12px;">${reference}</p>

      <p style="font-size: 12px; color: #45464d; margin: 0 0 4px;">Método de pago</p>
      <p style="font-size: 14px; font-weight: 600; margin: 0;">${paymentMethod}</p>
    </div>

    <div style="border: 1px solid #e2e8f0; padding: 16px; margin: 20px 0;">
      <p style="font-size: 12px; color: #45464d; margin: 0 0 4px;">Cliente</p>
      <p style="font-size: 14px; font-weight: 600; margin: 0 0 4px;">${customer.firstName} ${customer.lastName}</p>
      <p style="font-size: 13px; color: #45464d; margin: 0 0 4px;">${customer.email}</p>
      <p style="font-size: 13px; color: #45464d; margin: 0 0 12px;">${customer.phone}</p>

      <p style="font-size: 12px; color: #45464d; margin: 0 0 4px;">Dirección de envío</p>
      <p style="font-size: 13px; color: #191c1e; margin: 0;">
        ${customer.address.line}, ${customer.address.city}, ${customer.address.postalCode}, ${customer.address.country}
      </p>
    </div>

    ${renderLineItems(items, 'es')}

    <div style="margin: 16px 0;">
      <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
        <span style="color: #45464d;">Subtotal</span>
        <span>${formatEurCents(subtotalCents)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
        <span style="color: #45464d;">Envío</span>
        <span>${formatEurCents(shippingCents)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 600; margin-top: 8px;">
        <span>Total</span>
        <span>${formatEurCents(totalCents)}</span>
      </div>
    </div>
  `)
}

export async function sendOwnerNewOrderEmail(input: OwnerNewOrderEmailInput): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is not set')
  }

  const client = getResendClient()
  const { error } = await client.emails.send({
    from,
    to: input.to,
    subject: buildSubject(input),
    html: buildHtml(input),
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}

// ── Gotcha #2 — FUERA de scope en Fase 1 (ver sdd/notificaciones-fase1/spec
// del repo bamzuk-electronica, patrón fuente de esta función). Firma
// declarada por el design para dejar el mecanismo listo; sin uso, sin test,
// sin enganche en ningún catch. No activar sin una decisión de spec explícita.
export interface OwnerPaymentAnomalyInput {
  to: string
  reference: string
  checkoutId: string
  customer: CheckoutCustomer | null
  errorMessage: string
}

export async function sendOwnerPaymentAnomalyEmail(input: OwnerPaymentAnomalyInput): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is not set')
  }

  const client = getResendClient()
  const { error } = await client.emails.send({
    from,
    to: input.to,
    subject: `Pago cobrado sin pedido — ${input.reference}`,
    html: renderEmailShell(`
      <h1 style="font-size: 20px; margin-bottom: 8px;">Pago cobrado sin pedido creado</h1>
      <p style="font-size: 14px; color: #45464d;">Referencia: ${input.reference}</p>
      <p style="font-size: 14px; color: #45464d;">Checkout ID (SumUp): ${input.checkoutId}</p>
      ${
        input.customer
          ? `<p style="font-size: 14px; color: #45464d;">Cliente: ${input.customer.firstName} ${input.customer.lastName} — ${input.customer.email}</p>`
          : ''
      }
      <p style="font-size: 14px; color: #45464d;">Error: ${input.errorMessage}</p>
    `),
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}
