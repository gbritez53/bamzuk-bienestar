'use client'

import Image from 'next/image'
import { useCartStore } from '@/hooks/useCart'
import type { CartItem as CartItemType } from '@/lib/contracts'

interface CartItemProps {
  item: CartItemType
  locale: string
}

export default function CartItem({ item, locale }: CartItemProps) {
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const removeItem = useCartStore(s => s.removeItem)

  const price = (item.unitBasePrice / 100).toLocaleString(
    locale === 'pt' ? 'pt-PT' : 'es-ES',
    { style: 'currency', currency: 'EUR' },
  )

  return (
    <div className="flex gap-4 rounded-lg bg-card p-3 shadow-[var(--shadow-sm)]">
      {item.imageUrl ? (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      ) : (
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="h-8 w-8 text-muted-foreground/30"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.41a2.25 2.25 0 0 1 3.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
          </svg>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1.5">
        <p className="font-heading text-sm font-bold text-foreground">{item.name}</p>
        <p className="text-sm font-semibold text-primary">{price}</p>
        <div className="mt-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-border bg-muted px-1 py-0.5">
            <button
              onClick={() =>
                updateQuantity(item.productId, item.variantId, item.quantity - 1)
              }
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-light"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="min-w-[1.25rem] text-center text-xs font-semibold text-foreground">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                updateQuantity(item.productId, item.variantId, item.quantity + 1)
              }
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-light"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.productId, item.variantId)}
            className="ml-auto cursor-pointer text-xs font-semibold text-destructive transition-colors hover:opacity-80"
            aria-label="Eliminar"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
