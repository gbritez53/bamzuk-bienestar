// src/lib/email/shell.ts
// HTML compartido entre los mails de notificación de pedido (cliente y
// dueño): contenedor externo + font stack + footer, y la tabla de líneas de
// producto. Los cuerpos (subject + intro + secciones específicas) NO se
// comparten acá — cada mail arma el suyo y consume estos helpers.

import type { CartItem } from '@/lib/contracts'
import { nichoConfig } from '../../../nicho.config'

/**
 * Normaliza el locale (string libre, ej. viene de CheckoutPayload) a los
 * únicos dos idiomas soportados por los mails. Distinto de
 * `inferLocaleFromZip` (tracking-email.ts), que infiere por ZIP porque el
 * webhook de Dropea no tiene el locale real del checkout.
 */
export function normalizeLocale(l: string): 'es' | 'pt' {
  return l === 'pt' ? 'pt' : 'es'
}

export function formatEurCents(cents: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  )
}

const LINE_ITEMS_LABELS: Record<'es' | 'pt', { product: string; quantity: string; price: string }> = {
  es: { product: 'Producto', quantity: 'Cantidad', price: 'Precio' },
  pt: { product: 'Produto', quantity: 'Quantidade', price: 'Preço' },
}

export function renderLineItems(items: CartItem[], locale: 'es' | 'pt'): string {
  const labels = LINE_ITEMS_LABELS[locale]

  const rows = items
    .map(
      item => `
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #191c1e; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
          <td style="padding: 8px 0; font-size: 14px; color: #45464d; text-align: center; border-bottom: 1px solid #e2e8f0;">${item.quantity}</td>
          <td style="padding: 8px 0; font-size: 14px; color: #191c1e; text-align: right; border-bottom: 1px solid #e2e8f0;">${formatEurCents(item.unitBasePrice)}</td>
        </tr>`,
    )
    .join('')

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr>
          <th style="padding: 8px 0; font-size: 12px; color: #45464d; text-align: left; border-bottom: 1px solid #e2e8f0;">${labels.product}</th>
          <th style="padding: 8px 0; font-size: 12px; color: #45464d; text-align: center; border-bottom: 1px solid #e2e8f0;">${labels.quantity}</th>
          <th style="padding: 8px 0; font-size: 12px; color: #45464d; text-align: right; border-bottom: 1px solid #e2e8f0;">${labels.price}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

export function renderEmailShell(innerHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #191c1e;">
      ${innerHtml}
      <p style="font-size: 12px; color: #9ba1a6; margin-top: 32px;">${nichoConfig.name}</p>
    </div>
  `
}
