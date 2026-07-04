'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/hooks/useCart'
import CartSummary from './CartSummary'
import CartItem from './CartItem'
import {
  calcularEnvio,
  calcularPesoEfectivo,
  esEnvioGratis,
  getZoneFromCountry,
  getZoneLabel,
  DEFAULT_SHIPPING_SERVICE,
  type ShippingZone,
} from '@/lib/shipping'
import { useTranslations } from 'next-intl'

interface CartPageClientProps {
  locale: string
}

export default function CartPageClient({ locale }: CartPageClientProps) {
  const items = useCartStore(s => s.items)
  const subtotalCents = useCartStore(s => s.subtotalCents)
  const t = useTranslations('cart')

  const [selectedCountry, setSelectedCountry] = useState<'ES' | 'PT'>(
    locale === 'pt' ? 'PT' : 'ES',
  )

  const zone: ShippingZone = getZoneFromCountry(selectedCountry)
  const subtotalEur = subtotalCents / 100
  const freeShipping = esEnvioGratis(subtotalEur)
  const effectiveWeightKg = calcularPesoEfectivo(items)
  const shippingRate = calcularEnvio(effectiveWeightKg, DEFAULT_SHIPPING_SERVICE, zone)

  const zoneLabel = getZoneLabel(zone, locale)

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
          className="cursor-pointer text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          {t('continueShopping')}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        {items.map(item => (
          <CartItem
            key={`${item.productId}-${item.variantId ?? ''}`}
            item={item}
            locale={locale}
          />
        ))}
      </div>

      <div className="space-y-4 lg:col-span-4">
        {/* Country selector */}
        <div className="rounded-lg bg-card p-4 shadow-[var(--shadow-sm)]">
          <label className="mb-2 block text-xs font-semibold text-muted-foreground">
            {t('deliveryCountry')}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedCountry('ES')}
              className={`flex-1 cursor-pointer rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${
                selectedCountry === 'ES'
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/50'
              }`}
            >
              🇪🇸 España
            </button>
            <button
              type="button"
              onClick={() => setSelectedCountry('PT')}
              className={`flex-1 cursor-pointer rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${
                selectedCountry === 'PT'
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/50'
              }`}
            >
              🇵🇹 Portugal
            </button>
          </div>
        </div>

        <CartSummary
          shippingEur={shippingRate.costEur}
          isFreeShipping={freeShipping}
          locale={locale}
          zoneLabel={zoneLabel}
        />

        <Link
          href={`/${locale}/checkout`}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-light px-6 py-4 text-sm font-bold text-primary shadow-[var(--shadow-md)] transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
        >
          {t('checkout')}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>

        {/* Código promocional — visual, sin lógica de descuentos real todavía */}
        <div className="rounded-lg bg-card p-4 shadow-[var(--shadow-sm)]">
          <label className="mb-2 block text-xs font-semibold text-muted-foreground">
            {t('promoCode')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              disabled
              placeholder={t('promoCodePlaceholder')}
              className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              disabled
              className="rounded-lg border-2 border-primary-light px-4 py-2 text-sm font-semibold text-primary opacity-60"
            >
              {t('promoCodeApply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
