'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { nichoConfig } from '../../../nicho.config'
import { useCartStore } from '@/hooks/useCart'
import { Badge } from '@/components/ui/badge'
import CartDrawer from '@/components/cart/CartDrawer'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'

// Links de categoría — hoy son solo decorativos/de navegación general.
// Dropea no expone categorías de mascotas reales todavía, así que apuntan
// al catálogo completo (`/productos`) en vez de filtrar por categoría.
const CATEGORY_LINKS = ['dogs', 'cats', 'birds'] as const

export default function Header() {
  const t = useTranslations('navigation')
  const { itemCount } = useCartStore()
  const params = useParams()
  const locale = (params.locale as string) || 'es'
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--header-bg)] shadow-[var(--shadow-md)] backdrop-blur-lg">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href={`/${locale}`} className="shrink-0 cursor-pointer">
            <Image
              src="/logo-hz.png"
              alt={nichoConfig.name}
              width={5275}
              height={762}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          {/* Nav links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href={`/${locale}/productos`}
              className="cursor-pointer border-b-2 border-primary pb-1 text-sm font-bold text-primary transition-opacity hover:opacity-80"
            >
              {t('shopAll')}
            </Link>
            {CATEGORY_LINKS.map(key => (
              <Link
                key={key}
                href={`/${locale}/productos`}
                className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {t(key)}
              </Link>
            ))}
          </div>

          {/* Search (visual — sin lógica de búsqueda real todavía) */}
          <div className="hidden flex-1 items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 lg:flex lg:max-w-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
            />
          </div>

          {/* Icons */}
          <div className="flex shrink-0 items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir carrito"
              className="relative cursor-pointer text-primary transition-transform hover:-translate-y-0.5 hover:opacity-80"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <Badge className="absolute -top-2 -right-2">{itemCount}</Badge>
            </button>
          </div>
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
