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
    <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4">
      {item.imageUrl && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-50">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-sm font-medium text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-500">{price}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              updateQuantity(item.productId, item.variantId, item.quantity - 1)
            }
            className="h-7 w-7 rounded border text-sm hover:bg-gray-50"
            aria-label="Disminuir cantidad"
          >
            −
          </button>
          <span className="text-sm">{item.quantity}</span>
          <button
            onClick={() =>
              updateQuantity(item.productId, item.variantId, item.quantity + 1)
            }
            className="h-7 w-7 rounded border text-sm hover:bg-gray-50"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
          <button
            onClick={() => removeItem(item.productId, item.variantId)}
            className="ml-auto text-xs text-red-500 hover:text-red-700"
            aria-label="Eliminar"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
