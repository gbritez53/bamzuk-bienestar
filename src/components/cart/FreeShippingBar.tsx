'use client'

import { useTranslations } from 'next-intl'

interface FreeShippingBarProps {
  subtotalEur: number
  thresholdEur: number
  remainingEur: number
  isFree: boolean
  locale: string
}

export default function FreeShippingBar({
  subtotalEur,
  thresholdEur,
  remainingEur,
  isFree,
  locale,
}: FreeShippingBarProps) {
  const t = useTranslations('cart')

  if (thresholdEur <= 0) return null

  const fmt = (eur: number) =>
    eur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
      style: 'currency',
      currency: 'EUR',
    })

  if (isFree) {
    return (
      <div className="mb-8 flex items-center justify-center gap-2 rounded-xl border border-secondary/20 bg-secondary-light/40 p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 text-primary"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 12.75 11.25 15.75 16.5 9.75M8.625 3H15.375C15.7413 3 16.0765 3.19343 16.2515 3.51075L18.7515 8.01075C18.9152 8.31081 18.9152 8.68919 18.7515 8.98925L16.2515 13.4892C16.0765 13.8066 15.7413 14 15.375 14H8.625C8.25874 14 7.9235 13.8066 7.74848 13.4892L5.24848 8.98925C5.08483 8.68919 5.08483 8.31081 5.24848 8.01075L7.74848 3.51075C7.9235 3.19343 8.25874 3 8.625 3Z"
          />
        </svg>
        <p className="text-sm text-foreground">{t('freeShippingAchieved')}</p>
      </div>
    )
  }

  const percent = Math.min(100, Math.round((subtotalEur / thresholdEur) * 100))

  return (
    <div className="mb-8 rounded-xl border border-secondary/20 bg-secondary-light/40 p-4">
      <div className="flex items-center justify-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 flex-shrink-0 text-primary"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H2.25m6 0h9m0 0a1.5 1.5 0 0 0 3 0m-3 0a1.5 1.5 0 0 1 3 0m0 0h1.5m-1.5 0h-9M3.75 4.5h11.25a.75.75 0 0 1 .75.75v7.5m-12-8.25v8.25m0-8.25H2.25m1.5 0v8.25m0 0h13.5m-13.5 0a1.5 1.5 0 0 0-1.5 1.5v.75m15-2.25 3 3m0 0-3 3m3-3H15"
          />
        </svg>
        <p className="text-sm text-foreground">
          {t('freeShippingRemaining', { amount: fmt(remainingEur) })}
        </p>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-card">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
