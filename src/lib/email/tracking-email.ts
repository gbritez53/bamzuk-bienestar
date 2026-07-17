// src/lib/email/tracking-email.ts
// Mail de seguimiento — se manda una sola vez por orden, apenas Dropea le
// asigna transportista (tracking_code/tracking_url dejan de ser null).
// Solo muestra el código y el link de tracking del transportista (Tipsa/
// Dinapaq u otro) — no armamos página de tracking propia, el seguimiento
// real lo hace el cliente en la página del transportista.

import { getResendClient } from './resend'
import { nichoConfig } from '../../../nicho.config'

export interface TrackingEmailInput {
  to: string
  customerName: string | null
  orderId: string
  trackingCode: string
  trackingUrl: string
  carrierCompany: string | null
  locale: 'es' | 'pt'
}

/**
 * Infiere el idioma del cliente a partir del código postal: los de Portugal
 * usan el formato NNNN-NNN (con guión), los de España son 5 dígitos sin
 * guión. No tenemos el locale del checkout guardado en ningún lado
 * persistente para cuando llega el webhook, así que se infiere así.
 */
export function inferLocaleFromZip(zip: string | null): 'es' | 'pt' {
  if (zip && zip.includes('-')) return 'pt'
  return 'es'
}

function buildSubject(locale: 'es' | 'pt'): string {
  return locale === 'pt'
    ? `O teu pedido já está a caminho! 📦`
    : `¡Tu pedido ya está en camino! 📦`
}

function buildHtml(input: TrackingEmailInput): string {
  const { customerName, orderId, trackingCode, trackingUrl, carrierCompany, locale } = input
  const greeting = customerName
    ? locale === 'pt'
      ? `Olá, ${customerName}!`
      : `¡Hola, ${customerName}!`
    : locale === 'pt'
      ? 'Olá!'
      : '¡Hola!'

  const intro =
    locale === 'pt'
      ? 'O teu pedido já foi despachado. Podes seguir a entrega com o código abaixo:'
      : 'Tu pedido ya fue despachado. Podés seguir la entrega con el código de abajo:'

  const orderLabel = locale === 'pt' ? 'Pedido' : 'Pedido'
  const trackingLabel = locale === 'pt' ? 'Código de seguimento' : 'Código de seguimiento'
  const carrierLabel = locale === 'pt' ? 'Transportadora' : 'Transportista'
  const ctaLabel = locale === 'pt' ? 'Seguir o meu pedido' : 'Seguir mi pedido'
  const footer =
    locale === 'pt'
      ? `Obrigado por comprar em ${nichoConfig.name}.`
      : `Gracias por comprar en ${nichoConfig.name}.`

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #191c1e;">
      <h1 style="font-size: 20px; margin-bottom: 8px;">${greeting}</h1>
      <p style="font-size: 14px; color: #45464d; line-height: 1.5;">${intro}</p>

      <div style="border: 1px solid #e2e8f0; padding: 16px; margin: 20px 0;">
        <p style="font-size: 12px; color: #45464d; margin: 0 0 4px;">${orderLabel}</p>
        <p style="font-size: 14px; font-weight: 600; margin: 0 0 12px;">${orderId}</p>

        <p style="font-size: 12px; color: #45464d; margin: 0 0 4px;">${trackingLabel}</p>
        <p style="font-size: 14px; font-weight: 600; margin: 0 0 12px; font-family: monospace;">${trackingCode}</p>

        ${
          carrierCompany
            ? `<p style="font-size: 12px; color: #45464d; margin: 0 0 4px;">${carrierLabel}</p>
               <p style="font-size: 14px; font-weight: 600; margin: 0;">${carrierCompany}</p>`
            : ''
        }
      </div>

      <a href="${trackingUrl}" style="display: inline-block; background: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 600;">
        ${ctaLabel}
      </a>

      <p style="font-size: 12px; color: #9ba1a6; margin-top: 32px;">${footer}</p>
    </div>
  `
}

export async function sendTrackingEmail(input: TrackingEmailInput): Promise<void> {
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
