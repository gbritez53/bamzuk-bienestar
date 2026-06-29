// src/lib/dropea/mappers.ts
// Único punto de cambio entre schema raw de Dropea y DTOs de dominio (Design Decisión 1).
// Schema real confirmado via queries de exploración — 2026-06-29

import type {
  DropeaRawProduct,
  DropeaRawVariant,
  Product,
  ProductVariant,
  ProductImage,
} from './types'

export function mapDropeaProduct(raw: DropeaRawProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    sku: raw.sku,
    description: raw.description,
    category: raw.category,
    costPrice: raw.cost_price,
    pvpr: raw.pvpr,
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
