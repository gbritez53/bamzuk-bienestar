'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/hooks/useCart'
import CartItem from './CartItem'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  locale: string
}

export default function CartDrawer({ open, onClose, locale }: CartDrawerProps) {
  const t = useTranslations('cart')
  const items = useCartStore(s => s.items)
  const itemCount = useCartStore(s => s.itemCount)
  const subtotalCents = useCartStore(s => s.subtotalCents)

  const subtotalEur = subtotalCents / 100
  const fmt = (eur: number) =>
    eur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
      style: 'currency',
      currency: 'EUR',
    })

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex w-full max-w-sm flex-col bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            {t('title')}{' '}
            {itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg cursor-pointer p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cerrar carrito"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="mb-3 h-12 w-12 text-muted-foreground/30"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <p className="text-sm text-muted-foreground">{t('empty')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <CartItem
                  key={`${item.productId}-${item.variantId ?? ''}`}
                  item={item}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border bg-muted p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{t('total')}</span>
              <span className="font-heading text-lg font-bold text-primary">{fmt(subtotalEur)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={`/${locale}/carrito`}
                onClick={onClose}
                className="flex w-full cursor-pointer items-center justify-center rounded-xl border border-primary px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary-light"
              >
                {t('viewCart')}
              </Link>
              <Link
                href={`/${locale}/checkout`}
                onClick={onClose}
                className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-primary-light px-6 py-3 text-sm font-bold text-primary shadow-[var(--shadow-md)] transition-all hover:bg-primary hover:text-primary-foreground"
              >
                {t('checkout')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
