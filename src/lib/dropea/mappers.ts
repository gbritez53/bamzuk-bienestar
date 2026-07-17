// src/lib/dropea/mappers.ts
// Único punto de cambio entre schema raw de Dropea y DTOs de dominio (Design Decisión 1).
// Schema real confirmado via queries de exploración — 2026-06-29

import type {
  DropeaRawProduct,
  DropeaRawVariant,
  DropeaRawOrderTracking,
  Product,
  ProductVariant,
  ProductImage,
  OrderTracking,
} from './types'

// El pvpr SIEMPRE se recalcula con nuestro margen — se ignora el pvpr que
// manda Dropea (es su propio "precio recomendado", con un markup propio e
// inconsistente producto a producto, no el margen que definió el negocio).
// precio = costo_real / (1 - margen). costo_real = cost_price +
// fulfillment_cost (fee de picking/embalaje que Dropea cobra aparte).
// Umbrales y márgenes calibrados contra precios reales de mercado
// (Amazon) — cuanto más barato el costo, más alto el % de margen, porque
// en términos absolutos un producto de pocos euros necesita un % mayor
// para dejar una ganancia que valga la pena por venta.
function marginFor(realCost: number): number {
  if (realCost < 6) return 0.55
  if (realCost < 10) return 0.47
  if (realCost < 20) return 0.4
  return 0.35
}

function resolvePvpr(rawPvpr: number, costPrice: number, fulfillmentCost: number | null): number {
  const realCost = costPrice + (fulfillmentCost ?? 0)
  if (realCost <= 0) return rawPvpr // sin costo no se puede calcular — cae al pvpr de Dropea (o 0, queda oculto)

  const margin = marginFor(realCost)
  return Math.round((realCost / (1 - margin)) * 100) / 100
}

// Varios productos tienen la descripción generada con IA y pegada tal cual
// desde ChatGPT, con secciones dirigidas al DROPSHIPPER (revendedor) en vez
// de al cliente final — "¿Por qué es ideal para dropshipping?", un CTA para
// "agregarlo a tu tienda" con datos de campañas de ads, y hasta el SKU
// interno de la caja de embalaje. A veces también viene con el HTML crudo
// de la UI de ChatGPT pegado (divs y atributos data-message-*/class/dir).
// stripDropshipperContent saca todo eso y deja specs/beneficios/uso, que sí
// le sirven al cliente.
const REMOVE_SECTION_HEADINGS = [
  '¿por qué este producto es ideal para dropshipping?',
  'llamado a la acción',
  'recomendaciones de envío y embalaje',
  'ángulos de venta',
]

const KEEP_SECTION_HEADINGS = [
  'características del producto',
  'beneficios y puntos de venta',
  'beneficios del producto',
  'solución a puntos de dolor del cliente',
  'escenarios de uso y nichos potenciales',
  'especificaciones',
  'contenido del paquete',
]

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeHeading(html: string): string {
  return stripTags(html)
    .replace(/^[^\p{L}¿]+/u, '')
    .trim()
    .toLowerCase()
}

export function stripDropshipperContent(html: string): string {
  if (!html) return html

  // Desenvuelve el chrome de la UI de ChatGPT (divs/article + atributos
  // data-*/class/dir) que a veces viene pegado junto con el texto real.
  const unwrapped = html
    .replace(/<\/?(?:div|article)(?:\s[^>]*)?>/gi, '')
    .replace(/\s(?:data-[\w-]+|class|dir)="[^"]*"/gi, '')

  const chunks = unwrapped.split(/(?=<h[1-3][ >]|<p[ >]|<ul[ >]|<hr[ >/])/i).filter(Boolean)

  let dropping = false
  const kept: string[] = []

  for (const chunk of chunks) {
    const text = normalizeHeading(chunk)

    if (REMOVE_SECTION_HEADINGS.includes(text)) {
      dropping = true
      continue
    }
    if (KEEP_SECTION_HEADINGS.includes(text) || /^<h1[ >]/i.test(chunk)) {
      dropping = false
      kept.push(chunk)
      continue
    }
    // Secciones "fusionadas" en un solo <p> (heading + contenido juntos, sin
    // tag propio de heading) o el cierre tipo "¡Listo para vender...!".
    if (
      REMOVE_SECTION_HEADINGS.some(h => text.startsWith(h)) ||
      /dropshipping/i.test(text) ||
      /listo para vender/i.test(text)
    ) {
      continue
    }

    if (!dropping) kept.push(chunk)
  }

  return kept.join('').trim()
}

export function mapDropeaProduct(raw: DropeaRawProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    sku: raw.sku,
    description: stripDropshipperContent(raw.description),
    category: raw.category,
    costPrice: raw.cost_price,
    pvpr: resolvePvpr(raw.pvpr, raw.cost_price, raw.fulfillment_cost),
    weightKg: raw.weight,
    dimensions: {
      height: raw.height,
      width: raw.width,
      length: raw.length,
    },
    images: raw.images.map(mapImage),
    variants: raw.variants.map(mapDropeaVariant),
    isPublic: raw.state === 'PUBLIC',
  }
}

export function mapDropeaVariant(raw: DropeaRawVariant): ProductVariant {
  return {
    id: raw.id,
    name: raw.name,
    sku: raw.sku,
  }
}

function mapImage(url: string): ProductImage {
  return { url, alt: '' }
}

export function mapDropeaOrderTracking(raw: DropeaRawOrderTracking): OrderTracking {
  return {
    id: raw.id,
    status: raw.status,
    trackingCode: raw.tracking_code,
    trackingUrl: raw.tracking_url,
    carrierCompany: raw.carrier_company,
    customerEmail: raw.customer?.email ?? null,
    customerName: raw.customer?.full_name ?? null,
    customerZip: raw.customer?.zip ?? null,
  }
}
