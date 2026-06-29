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
  const totalWeightKg = items.reduce(
    (sum, item) => sum + (item.weightKg ?? 0) * item.quantity,
    0,
  )
  const shippingRate = calcularEnvio(
    totalWeightKg > 0 ? totalWeightKg : null,
    DEFAULT_SHIPPING_SERVICE,
  )

  const fmt = (eur: number) =>
    eur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
      style: 'currency',
      currency: 'EUR',
    })

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="mb-4 h-16 w-16 text-muted-foreground/20"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>
        <p className="mb-2 text-lg font-medium text-foreground">{t('empty')}</p>
        <Link
          href={`/${locale}/productos`}
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          {t('continueShopping')}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {items.map(item => (
          <div
            key={`${item.productId}-${item.variantId ?? ''}`}
            className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            {item.imageUrl && (
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
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
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-sm font-semibold text-primary">{fmt(item.unitBasePrice / 100)}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.variantId, item.quantity - 1)
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  −
                </button>
                <span className="text-sm font-medium text-foreground">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.variantId, item.quantity + 1)
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="ml-auto text-xs font-medium text-destructive hover:text-red-700"
                >
                  {t('remove')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <CartSummary
          shippingEur={shippingRate.costEur}
          isFreeShipping={freeShipping}
          locale={locale}
        />
        <Link
          href={`/${locale}/checkout`}
          className="flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl"
        >
          {t('checkout')}
        </Link>
      </div>
    </div>
  )
}
