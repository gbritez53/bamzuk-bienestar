'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/hooks/useCart'
import CartItem from './CartItem'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  locale: string
}

export default function CartDrawer({ open, onClose, locale }: CartDrawerProps) {
  const items = useCartStore(s => s.items)
  const itemCount = useCartStore(s => s.itemCount)
  const subtotalCents = useCartStore(s => s.subtotalCents)

  const subtotalEur = subtotalCents / 100
  const fmt = (eur: number) =>
    eur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
      style: 'currency',
      currency: 'EUR',
    })

  // Cerrar con Escape
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-sm flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Carrito ({itemCount})
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Cerrar carrito"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Tu carrito está vacío
            </p>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <CartItem key={`${item.productId}-${item.variantId ?? ''}`} item={item} locale={locale} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="mb-4 flex justify-between text-sm font-semibold text-gray-900">
              <span>Total</span>
              <span>{fmt(subtotalEur)}</span>
            </div>
            <Link
              href={`/${locale}/checkout`}
              onClick={onClose}
              className="block w-full rounded-lg bg-gray-900 px-6 py-3 text-center text-sm font-medium text-white hover:bg-gray-700"
            >
              Ir al checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
