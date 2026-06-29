import { describe, it, expectTypeOf } from 'vitest'
import type {
  CartItem,
  CartItemDimensions,
  ShippingCalculation,
  Address,
  CheckoutPayload,
  OrderCreated,
  OrderStatus,
} from '@/lib/contracts'

describe('contracts — type-level tests (Design Decisión 4)', () => {
  describe('CartItem', () => {
    it('productId es string', () => {
      expectTypeOf<CartItem['productId']>().toEqualTypeOf<string>()
    })

    it('variantId acepta null', () => {
      expectTypeOf<CartItem['variantId']>().toEqualTypeOf<string | null>()
    })

    it('unitBasePrice es number (céntimos SIN IVA)', () => {
      expectTypeOf<CartItem['unitBasePrice']>().toEqualTypeOf<number>()
    })

    it('weightKg acepta null (fallback shipping)', () => {
      expectTypeOf<CartItem['weightKg']>().toEqualTypeOf<number | null>()
    })

    it('dimensions acepta null o CartItemDimensions', () => {
      expectTypeOf<CartItem['dimensions']>().toEqualTypeOf<{
        lengthCm: number
        widthCm: number
        heightCm: number
      } | null>()
    })

    it('imageUrl acepta null', () => {
      expectTypeOf<CartItem['imageUrl']>().toEqualTypeOf<string | null>()
    })

    it('quantity es number', () => {
      expectTypeOf<CartItem['quantity']>().toEqualTypeOf<number>()
    })
  })

  describe('ShippingCalculation', () => {
    it('totalWeightKg es number', () => {
      expectTypeOf<ShippingCalculation['totalWeightKg']>().toEqualTypeOf<number>()
    })

    it('cost es number (céntimos EUR)', () => {
      expectTypeOf<ShippingCalculation['cost']>().toEqualTypeOf<number>()
    })

    it('usedFallback es boolean', () => {
      expectTypeOf<ShippingCalculation['usedFallback']>().toEqualTypeOf<boolean>()
    })
  })

  describe('Address', () => {
    it('country está restringido a ES o PT', () => {
      expectTypeOf<Address['country']>().toEqualTypeOf<'ES' | 'PT'>()
    })

    it('line, city, postalCode son strings', () => {
      expectTypeOf<Address['line']>().toEqualTypeOf<string>()
      expectTypeOf<Address['city']>().toEqualTypeOf<string>()
      expectTypeOf<Address['postalCode']>().toEqualTypeOf<string>()
    })
  })

  describe('CheckoutPayload', () => {
    it('items es CartItem[]', () => {
      expectTypeOf<CheckoutPayload['items']>().toEqualTypeOf<CartItem[]>()
    })

    it('shipping es ShippingCalculation', () => {
      expectTypeOf<CheckoutPayload['shipping']>().toEqualTypeOf<ShippingCalculation>()
    })

    it('locale está restringido a es o pt', () => {
      expectTypeOf<CheckoutPayload['locale']>().toEqualTypeOf<'es' | 'pt'>()
    })

    it('vatRate es 0.21 o 0.23 (ES o PT)', () => {
      expectTypeOf<CheckoutPayload['vatRate']>().toEqualTypeOf<0.21 | 0.23>()
    })

    it('paymentMethod es sumup o cod', () => {
      expectTypeOf<CheckoutPayload['paymentMethod']>().toEqualTypeOf<'sumup' | 'cod'>()
    })

    it('subtotalWithVat y total son numbers (céntimos)', () => {
      expectTypeOf<CheckoutPayload['subtotalWithVat']>().toEqualTypeOf<number>()
      expectTypeOf<CheckoutPayload['total']>().toEqualTypeOf<number>()
    })

    it('customer tiene name, email y address tipados', () => {
      expectTypeOf<CheckoutPayload['customer']['name']>().toEqualTypeOf<string>()
      expectTypeOf<CheckoutPayload['customer']['email']>().toEqualTypeOf<string>()
      expectTypeOf<CheckoutPayload['customer']['address']>().toEqualTypeOf<Address>()
    })
  })

  describe('OrderCreated', () => {
    it('orderId es string', () => {
      expectTypeOf<OrderCreated['orderId']>().toEqualTypeOf<string>()
    })

    it('status es OrderStatus', () => {
      expectTypeOf<OrderCreated['status']>().toEqualTypeOf<OrderStatus>()
    })

    it('paymentMethod es sumup o cod', () => {
      expectTypeOf<OrderCreated['paymentMethod']>().toEqualTypeOf<'sumup' | 'cod'>()
    })

    it('total es number (céntimos)', () => {
      expectTypeOf<OrderCreated['total']>().toEqualTypeOf<number>()
    })

    it('createdAt es string (ISO)', () => {
      expectTypeOf<OrderCreated['createdAt']>().toEqualTypeOf<string>()
    })
  })

  describe('OrderStatus', () => {
    it('es union de todos los estados válidos', () => {
      type AllStatuses =
        | 'pending'
        | 'confirmed'
        | 'shipped'
        | 'delivered'
        | 'incident'
        | 'cancelled'
      expectTypeOf<OrderStatus>().toEqualTypeOf<AllStatuses>()
    })
  })
})
