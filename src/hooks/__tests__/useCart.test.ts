import { describe, it, expect, beforeEach } from 'vitest'

// Reset módulo entre tests para limpiar el store singleton de Zustand
beforeEach(async () => {
  const { useCartStore } = await import('@/hooks/useCart')
  useCartStore.getState().clearCart()
})

describe('useCartStore — addItem', () => {
  it('agrega un item al carrito vacío', async () => {
    const { useCartStore } = await import('@/hooks/useCart')
    useCartStore.getState().addItem({
      productId: '1', variantId: null, name: 'Test', unitBasePrice: 1000,
      weightKg: 0.5, dimensions: null, imageUrl: null, quantity: 1,
    })
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('incrementa quantity si el mismo producto ya está en el carrito', async () => {
    const { useCartStore } = await import('@/hooks/useCart')
    const item = { productId: '1', variantId: null, name: 'Test', unitBasePrice: 1000, weightKg: 0.5, dimensions: null, imageUrl: null, quantity: 1 }
    useCartStore.getState().addItem(item)
    useCartStore.getState().addItem(item)
    const items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0]?.quantity).toBe(2)
  })

  it('trata products con distinto variantId como items separados', async () => {
    const { useCartStore } = await import('@/hooks/useCart')
    useCartStore.getState().addItem({ productId: '1', variantId: 'A', name: 'Test A', unitBasePrice: 1000, weightKg: 0.5, dimensions: null, imageUrl: null, quantity: 1 })
    useCartStore.getState().addItem({ productId: '1', variantId: 'B', name: 'Test B', unitBasePrice: 1000, weightKg: 0.5, dimensions: null, imageUrl: null, quantity: 1 })
    expect(useCartStore.getState().items).toHaveLength(2)
  })
})

describe('useCartStore — removeItem', () => {
  it('elimina el item por productId+variantId', async () => {
    const { useCartStore } = await import('@/hooks/useCart')
    useCartStore.getState().addItem({ productId: '1', variantId: null, name: 'Test', unitBasePrice: 1000, weightKg: 0.5, dimensions: null, imageUrl: null, quantity: 1 })
    useCartStore.getState().removeItem('1', null)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('useCartStore — updateQuantity', () => {
  it('actualiza la cantidad a un valor positivo', async () => {
    const { useCartStore } = await import('@/hooks/useCart')
    useCartStore.getState().addItem({ productId: '1', variantId: null, name: 'Test', unitBasePrice: 1000, weightKg: 0.5, dimensions: null, imageUrl: null, quantity: 1 })
    useCartStore.getState().updateQuantity('1', null, 3)
    expect(useCartStore.getState().items[0]?.quantity).toBe(3)
  })

  it('elimina el item si quantity <= 0', async () => {
    const { useCartStore } = await import('@/hooks/useCart')
    useCartStore.getState().addItem({ productId: '1', variantId: null, name: 'Test', unitBasePrice: 1000, weightKg: 0.5, dimensions: null, imageUrl: null, quantity: 1 })
    useCartStore.getState().updateQuantity('1', null, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('useCartStore — selectores derivados', () => {
  it('itemCount es la suma de quantities', async () => {
    const { useCartStore } = await import('@/hooks/useCart')
    useCartStore.getState().addItem({ productId: '1', variantId: null, name: 'A', unitBasePrice: 1000, weightKg: 0.5, dimensions: null, imageUrl: null, quantity: 2 })
    useCartStore.getState().addItem({ productId: '2', variantId: null, name: 'B', unitBasePrice: 2000, weightKg: 1.0, dimensions: null, imageUrl: null, quantity: 3 })
    expect(useCartStore.getState().itemCount).toBe(5)
  })

  it('subtotalCents es sum(unitBasePrice * quantity)', async () => {
    const { useCartStore } = await import('@/hooks/useCart')
    useCartStore.getState().addItem({ productId: '1', variantId: null, name: 'A', unitBasePrice: 1000, weightKg: 0.5, dimensions: null, imageUrl: null, quantity: 2 })
    expect(useCartStore.getState().subtotalCents).toBe(2000)
  })

  it('clearCart vacía el carrito', async () => {
    const { useCartStore } = await import('@/hooks/useCart')
    useCartStore.getState().addItem({ productId: '1', variantId: null, name: 'Test', unitBasePrice: 1000, weightKg: 0.5, dimensions: null, imageUrl: null, quantity: 1 })
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
