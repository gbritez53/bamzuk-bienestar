'use client'

import { useCartStore } from '@/hooks/useCart'
import { useTranslations } from 'next-intl'

interface CartSummaryProps {
  shippingEur: number
  isFreeShipping: boolean
  locale: string
  zoneLabel?: string
}

export default function CartSummary({
  shippingEur,
  isFreeShipping,
  locale,
  zoneLabel,
}: CartSummaryProps) {
  const subtotalCents = useCartStore(s => s.subtotalCents)
  const t = useTranslations('cart')
  const fmt = (eur: number) =>
    eur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
      style: 'currency',
      currency: 'EUR',
    })

  const subtotalEur = subtotalCents / 100
  const totalEur = subtotalEur + (isFreeShipping ? 0 : shippingEur)

  return (
    <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-lg)]">
      <h2 className="mb-5 font-heading text-xl font-bold text-foreground">
        {t('summaryTitle')}
      </h2>
      <dl className="space-y-3 border-b border-border pb-5">
        <div className="flex justify-between text-sm">
          <dt className="text-muted-foreground">{t('subtotal')}</dt>
          <dd className="font-semibold text-foreground">{fmt(subtotalEur)}</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-muted-foreground">
            {t('shipping')}
            {zoneLabel && (
              <span className="ml-1 text-xs">({zoneLabel})</span>
            )}
          </dt>
          <dd
            className={
              isFreeShipping ? 'font-semibold text-success' : 'font-semibold text-foreground'
            }
          >
            {isFreeShipping ? t('freeShipping') : fmt(shippingEur)}
          </dd>
        </div>
      </dl>
      <div className="flex justify-between pt-5 font-heading text-lg font-bold">
        <span className="text-foreground">{t('total')}</span>
        <span className="text-primary">{fmt(totalEur)}</span>
      </div>
    </div>
  )
}
