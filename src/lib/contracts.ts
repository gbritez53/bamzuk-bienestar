// Contratos cross-dominio (zona neutral)
// Definidos en Design Decisión 4 — implementados en Fase 1

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'incident'
  | 'cancelled'

export interface CartItemDimensions {
  lengthCm: number
  widthCm: number
  heightCm: number
}

export interface CartItem {
  productId: string
  variantId: string | null
  name: string
  unitBasePrice: number // céntimos, SIN IVA
  weightKg: number | null
  dimensions: CartItemDimensions | null
  imageUrl: string | null
  quantity: number // >= 1
}

export interface ShippingCalculation {
  totalWeightKg: number
  cost: number // céntimos EUR
  usedFallback: boolean // true si algún item sin peso
}

export interface Address {
  line: string
  city: string
  postalCode: string
  country: 'ES' | 'PT'
}

export interface CheckoutPayload {
  items: CartItem[]
  shipping: ShippingCalculation
  locale: 'es' | 'pt'
  vatRate: 0.21 | 0.23
  customer: { name: string; email: string; address: Address }
  paymentMethod: 'sumup' | 'cod'
  subtotalWithVat: number
  total: number // subtotal+shipping, céntimos
}

export interface OrderCreated {
  orderId: string
  status: OrderStatus
  paymentMethod: 'sumup' | 'cod'
  total: number
  createdAt: string // ISO
}
