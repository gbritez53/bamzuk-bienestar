// src/lib/email/order-confirmation-email.ts
// Mail de confirmación al CLIENTE — se manda apenas createDropeaOrder
// devuelve un orderId real, en tarjeta y en COD. Bilingüe ES/PT (locale
// real del checkout, NO inferLocaleFromZip — ese es exclusivo del webhook
// de tracking, que no tiene el locale real).

import type { CartItem } from '@/lib/contracts'
import { getResendClient } from './resend'
import { renderEmailShell, renderLineItems, formatEurCents } from './shell'

export interface OrderConfirmationEmailInput {
  to: string
  customerName: string | null
  orderId: string
  items: CartItem[]
  subtotalCents: number
  shippingEur: number
  paymentMethod: 'PAID' | 'CASH_ON_DELIVERY'
  locale: 'es' | 'pt'
}

function buildSubject(locale: 'es' | 'pt'): string {
  return locale === 'pt' ? 'Recebemos o teu pedido! 🎉' : '¡Recibimos tu pedido! 🎉'
}

function buildHtml(input: OrderConfirmationEmailInput): string {
  const { customerName, orderId, items, subtotalCents, shippingEur, paymentMethod, locale } = input

  const greeting = customerName
    ? locale === 'pt'
      ? `Olá, ${customerName}!`
      : `¡Hola, ${customerName}!`
    : locale === 'pt'
      ? 'Olá!'
      : '¡Hola!'

  const intro =
    locale === 'pt'
      ? 'Recebemos o teu pedido e já está a ser preparado.'
      : 'Recibimos tu pedido y ya lo estamos preparando.'

  const orderLabel = locale === 'pt' ? 'Pedido' : 'Pedido'
  const subtotalLabel = locale === 'pt' ? 'Subtotal' : 'Subtotal'
  const shippingLabel = locale === 'pt' ? 'Envio' : 'Envío'
  const totalLabel = locale === 'pt' ? 'Total' : 'Total'

  const shippingCents = Math.round(shippingEur * 100)
  const totalCents = subtotalCents + shippingCents

  const codNote =
    paymentMethod === 'CASH_ON_DELIVERY'
      ? `<p style="font-size: 13px; color: #45464d; background: #f5f5f5; padding: 12px; margin: 16px 0;">${
          locale === 'pt'
            ? 'Vais pagar em dinheiro no momento da entrega.'
            : 'Vas a pagar en efectivo al recibir el pedido.'
        }</p>`
      : ''

  return renderEmailShell(`
    <h1 style="font-size: 20px; margin-bottom: 8px;">${greeting}</h1>
    <p style="font-size: 14px; color: #45464d; line-height: 1.5;">${intro}</p>

    <div style="border: 1px solid #e2e8f0; padding: 16px; margin: 20px 0;">
      <p style="font-size: 12px; color: #45464d; margin: 0 0 4px;">${orderLabel}</p>
      <p style="font-size: 14px; font-weight: 600; margin: 0;">${orderId}</p>
    </div>

    ${renderLineItems(items, locale)}

    <div style="margin: 16px 0;">
      <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
        <span style="color: #45464d;">${subtotalLabel}</span>
        <span>${formatEurCents(subtotalCents)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
        <span style="color: #45464d;">${shippingLabel}</span>
        <span>${formatEurCents(shippingCents)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 600; margin-top: 8px;">
        <span>${totalLabel}</span>
        <span>${formatEurCents(totalCents)}</span>
      </div>
    </div>

    ${codNote}
  `)
}

export async function sendOrderConfirmationEmail(input: OrderConfirmationEmailInput): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is not set')
  }

  const client = getResendClient()
  const { error } = await client.emails.send({
    from,
    to: input.to,
    subject: buildSubject(input.locale),
    html: buildHtml(input),
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}
