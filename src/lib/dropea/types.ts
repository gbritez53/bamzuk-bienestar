// src/lib/dropea/types.ts
// Schema real de Dropea — descubierto via queries de exploración (introspección desactivada en prod)
// Última actualización: 2026-06-29

// ============================================================
// RAW — schema GraphQL exacto que devuelve Dropea
// ============================================================

export interface DropeaRawVariant {
  id: string
  name: string
  sku: string
  state: string
}

export interface DropeaRawProduct {
  id: string
  name: string
  sku: string
  description: string
  state: string         // 'PUBLIC' | 'PRIVATE'
  weight: number        // kg
  height: number        // cm
  width: number         // cm
  length: number        // cm
  pvpr: number          // precio venta público recomendado (EUR)
  cost_price: number    // precio de costo para el dropshipper (EUR)
  fulfillment_cost: number | null // fee de picking/embalaje que cobra Dropea aparte del cost_price (EUR)
  images: string[]      // array de URLs directas (no objetos)
  category: string      // nombre de categoría como string
  variants: DropeaRawVariant[]
}

export interface DropeaRawProductPagination {
  data: DropeaRawProduct[]
  total: number
  current_page: number
  last_page: number
  per_page: number
}

export interface DropeaRawShop {
  id: string
  name: string
}

export interface DropeaRawShopPagination {
  data: DropeaRawShop[]
  total: number
}

export interface DropeaRawUser {
  id: string
  name: string
  shops: DropeaRawShopPagination
}

export interface DropeaRawOrder {
  id: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DropeaRawOrderPagination {
  data: DropeaRawOrder[]
  total: number
  current_page: number
  last_page: number
  per_page: number
}

export interface DropeaRawOrderTracking {
  id: string
  status: string
  tracking_code: string | null
  tracking_url: string | null
  carrier_company: string | null
  shop: { id: string } | null
  customer: {
    full_name: string | null
    email: string | null
    zip: string | null
  } | null
}

export interface DropeaRawOrderTrackingPagination {
  data: DropeaRawOrderTracking[]
}

// ============================================================
// DTOs de dominio — tipos estables que consume la app
// Son los ÚNICOS que cruzan fronteras de dominio.
// El mapper (mappers.ts) es el único punto de cambio entre raw ↔ DTO.
// ============================================================

export interface ProductImage {
  url: string
  alt: string
}

export interface ProductVariant {
  id: string
  name: string
  sku: string
}

export interface Product {
  id: string
  name: string
  sku: string
  description: string
  category: string
  costPrice: number     // precio de costo (lo que pagás a Dropea)
  pvpr: number          // precio recomendado de venta
  weightKg: number      // para calcular shipping
  dimensions: {
    height: number
    width: number
    length: number
  }
  images: ProductImage[]
  variants: ProductVariant[]
  isPublic: boolean
}

export interface ProductPage {
  items: Product[]
  total: number
  currentPage: number
  lastPage: number
  perPage: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'incident'
  | 'cancelled'

export interface Order {
  id: string
  status: OrderStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderTracking {
  id: string
  status: string
  trackingCode: string | null
  trackingUrl: string | null
  carrierCompany: string | null
  shopId: string | null
  customerEmail: string | null
  customerName: string | null
  customerZip: string | null
}
