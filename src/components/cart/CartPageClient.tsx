'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/hooks/useCart'
import CartSummary from './CartSummary'
import { calcularEnvio, esEnvioGratis, DEFAULT_SHIPPING_SERVICE } from '@/lib/shipping'
import { useTranslations } from 'next-intl'

interface CartPageClientProps {
  locale: string
}

export default function CartPageClient({ locale }: CartPageClientProps) {
  const items = useCartStore(s => s.items)
  const removeItem = useCartStore(s => s.removeItem)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const subtotalCents = useCartStore(s => s.subtotalCents)
  const t = useTranslations('cart')

  const subtotalEur = subtotalCents / 100
  const freeShipping = esEnvioGratis(subtotalEur)

  // Compute total weight handling null weightKg per item
  const totalWeightKg = items.reduce(
    (sum, item) => sum + (item.weightKg ?? 0) * item.quantity,
    0,
  )
  const shippingRate = calcularEnvio(
    totalWeightKg > 0 ? totalWeightKg : null,
    DEFAULT_SHIPPING_SERVICE,
  )

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-gray-500">{t('empty')}</p>
        <Link
          href={`/${locale}/productos`}
          className="text-sm font-medium text-gray-900 underline"
        >
          {t('continueShopping')}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Items */}
      <div className="space-y-4 lg:col-span-2">
        {items.map(item => (
          <div
            key={`${item.productId}-${item.variantId ?? ''}`}
            className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4"
          >
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
              <p className="text-sm text-gray-500">
                {(item.unitBasePrice / 100).toLocaleString(
                  locale === 'pt' ? 'pt-PT' : 'es-ES',
                  { style: 'currency', currency: 'EUR' },
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                  className="h-7 w-7 rounded border text-sm hover:bg-gray-50"
                >
                  −
                </button>
                <span className="text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                  className="h-7 w-7 rounded border text-sm hover:bg-gray-50"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="ml-auto text-xs text-red-500 hover:text-red-700"
                >
                  {t('remove')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="space-y-4">
        <CartSummary
          shippingEur={shippingRate.costEur}
          isFreeShipping={freeShipping}
          locale={locale}
        />
        <Link
          href={`/${locale}/checkout`}
          className="block w-full rounded-lg bg-gray-900 px-6 py-3 text-center text-sm font-medium text-white hover:bg-gray-700"
        >
          {t('checkout')}
        </Link>
      </div>
    </div>
  )
}
