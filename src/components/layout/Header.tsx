'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { nichoConfig } from '../../../nicho.config'
import { useCartStore } from '@/hooks/useCart'
import { Badge } from '@/components/ui/badge'
import CartDrawer from '@/components/cart/CartDrawer'

export default function Header() {
  const t = useTranslations('navigation')
  const { itemCount } = useCartStore()
  const params = useParams()
  const locale = (params.locale as string) || 'es'
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo / site name */}
          <Link href={`/${locale}`} className="text-lg font-bold tracking-tight text-gray-900">
            {nichoConfig.name}
          </Link>

          {/* Main navigation */}
          <div className="hidden gap-6 sm:flex">
            <Link
              href={`/${locale}/productos`}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {t('products')}
            </Link>
          </div>

          {/* Cart */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir carrito"
            className="relative flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            <Badge>{itemCount}</Badge>
          </button>
        </nav>
      </header>

      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        locale={locale}
      />
    </>
  )
}
