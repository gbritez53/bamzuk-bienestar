'use client'

import { useCartStore } from '@/hooks/useCart'
import { useTranslations } from 'next-intl'

interface CartSummaryProps {
  shippingEur: number
  isFreeShipping: boolean
  locale: string
}

export default function CartSummary({ shippingEur, isFreeShipping, locale }: CartSummaryProps) {
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
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Resumen</h2>
      <dl className="space-y-2">
        <div className="flex justify-between text-sm">
          <dt className="text-gray-600">{t('total')}</dt>
          <dd className="font-medium">{fmt(subtotalEur)}</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-gray-600">{t('shipping')}</dt>
          <dd className={isFreeShipping ? 'font-medium text-green-600' : 'font-medium'}>
            {isFreeShipping ? t('freeShipping') : fmt(shippingEur)}
          </dd>
        </div>
        <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-base font-semibold">
          <dt>{t('total')}</dt>
          <dd>{fmt(totalEur)}</dd>
        </div>
      </dl>
    </div>
  )
}
