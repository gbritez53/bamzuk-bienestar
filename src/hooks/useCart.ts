'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/lib/contracts'

interface CartStore {
  items: CartItem[]
  itemCount: number
  subtotalCents: number
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId: string | null) => void
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void
  clearCart: () => void
}

const isSameItem = (a: CartItem, b: Pick<CartItem, 'productId' | 'variantId'>) =>
  a.productId === b.productId && a.variantId === b.variantId

function derived(items: CartItem[]) {
  return {
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotalCents: items.reduce((s, i) => s + i.unitBasePrice * i.quantity, 0),
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      subtotalCents: 0,

      addItem(newItem) {
        set(state => {
          const existing = state.items.find(i => isSameItem(i, newItem))
          const items = existing
            ? state.items.map(i =>
                isSameItem(i, newItem)
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i,
              )
            : [...state.items, newItem]
          return { items, ...derived(items) }
        })
      },

      removeItem(productId, variantId) {
        set(state => {
          const items = state.items.filter(i => !isSameItem(i, { productId, variantId }))
          return { items, ...derived(items) }
        })
      },

      updateQuantity(productId, variantId, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set(state => {
          const items = state.items.map(i =>
            isSameItem(i, { productId, variantId }) ? { ...i, quantity } : i,
          )
          return { items, ...derived(items) }
        })
      },

      clearCart() {
        set({ items: [], itemCount: 0, subtotalCents: 0 })
      },
    }),
    {
      name: 'cart-dropshipping',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
