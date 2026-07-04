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
      dimensions: product.dimensions
        ? {
            lengthCm: product.dimensions.length,
            widthCm: product.dimensions.width,
            heightCm: product.dimensions.height,
          }
        : null,
      imageUrl: product.images[0]?.url ?? null,
      quantity: 1,
    })
  }

  return (
    <button
      onClick={handleClick}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-light px-6 py-4 text-sm font-bold text-primary shadow-[var(--shadow-md)] transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      {t('addToCart')}
    </button>
  )
}
