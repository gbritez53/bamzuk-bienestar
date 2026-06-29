'use client'

import { useCartStore } from '@/hooks/useCart'
import type { Product } from '@/lib/dropea/types'
import { useTranslations } from 'next-intl'

interface AddToCartButtonProps {
  product: Product
  variantId?: string
}

export default function AddToCartButton({ product, variantId }: AddToCartButtonProps) {
  const addItem = useCartStore(s => s.addItem)
  const t = useTranslations('products')

  function handleClick() {
    addItem({
      productId: product.id,
      variantId: variantId ?? null,
      name: product.name,
      unitBasePrice: Math.round(product.pvpr * 100),
      weightKg: product.weightKg,
      imageUrl: product.images[0]?.url ?? null,
      quantity: 1,
    })
  }

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 active:bg-gray-800"
    >
      {t('addToCart')}
    </button>
  )
}
