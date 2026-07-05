'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

// Los valores del slider de precio no tienen representación visual,
// pero filtran correctamente por pvpr (precio de venta).
const PRICE_MIN = 0
const PRICE_MAX = 100

interface CatalogFiltersProps {
  locale: string
}

export default function CatalogFilters({ locale }: CatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('catalogFilters')

  // Leer estado actual desde URL
  const rawSearch = searchParams.get('search') ?? ''
  const rawMinPrice = searchParams.get('minPrice')
  const rawMaxPrice = searchParams.get('maxPrice')

  const [search, setSearch] = useState(rawSearch)
  const [minPrice, setMinPrice] = useState(rawMinPrice ? Number(rawMinPrice) : PRICE_MIN)
  const [maxPrice, setMaxPrice] = useState(rawMaxPrice ? Number(rawMaxPrice) : PRICE_MAX)

  // Sincronizar cuando la URL cambia externamente (navegación atrás/adelante)
  useEffect(() => {
    setSearch(rawSearch)
    setMinPrice(rawMinPrice ? Number(rawMinPrice) : PRICE_MIN)
    setMaxPrice(rawMaxPrice ? Number(rawMaxPrice) : PRICE_MAX)
  }, [rawSearch, rawMinPrice, rawMaxPrice])

  const buildHref = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      // Resetear página cuando cambia un filtro
      params.delete('page')
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || value === '0') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      const qs = params.toString()
      return `${pathname}${qs ? `?${qs}` : ''}`
    },
    [pathname, searchParams],
  )

  function applyFilters(updates: Record<string, string | null>) {
    router.push(buildHref(updates))
  }

  return (
    <aside className="w-full shrink-0 md:w-64">
      <div className="space-y-8">
        {/* Búsqueda por texto */}
        <div>
          <h3 className="mb-4 font-heading text-base font-bold text-foreground">
            {t('search')}
          </h3>
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              // Debounce implícito: aplica al perder foco o al apretar Enter
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                applyFilters({ search: search || null })
              }
            }}
            onBlur={() => applyFilters({ search: search || null })}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Rango de precio — slider dual */}
        <div>
          <h3 className="mb-4 font-heading text-base font-bold text-foreground">{t('price')}</h3>
          <div className="relative h-6">
            {/* Track de fondo */}
            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-secondary-light" />
            {/* Track activo entre los dos thumbnails */}
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
              style={{
                left: `${(minPrice / PRICE_MAX) * 100}%`,
                width: `${((maxPrice - minPrice) / PRICE_MAX) * 100}%`,
              }}
            />
            {/* Slider min */}
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              value={minPrice}
              onChange={e => {
                const v = Number(e.target.value)
                setMinPrice(Math.min(v, maxPrice - 1))
              }}
              onMouseUp={() => applyFilters({ minPrice: minPrice > 0 ? String(Math.min(minPrice, maxPrice - 1)) : null })}
              onTouchEnd={() => applyFilters({ minPrice: minPrice > 0 ? String(Math.min(minPrice, maxPrice - 1)) : null })}
              className="pointer-events-none absolute inset-0 z-10 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[var(--shadow-md)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-[var(--shadow-md)] [&::-moz-range-thumb]:cursor-pointer"
              aria-label={t('priceMin')}
            />
            {/* Slider max */}
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              value={maxPrice}
              onChange={e => {
                const v = Number(e.target.value)
                setMaxPrice(Math.max(v, minPrice + 1))
              }}
              onMouseUp={() => applyFilters({ maxPrice: maxPrice < PRICE_MAX ? String(Math.max(maxPrice, minPrice + 1)) : null })}
              onTouchEnd={() => applyFilters({ maxPrice: maxPrice < PRICE_MAX ? String(Math.max(maxPrice, minPrice + 1)) : null })}
              className="pointer-events-none absolute inset-0 z-20 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[var(--shadow-md)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-[var(--shadow-md)] [&::-moz-range-thumb]:cursor-pointer"
              aria-label={t('priceMax')}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>{minPrice}€</span>
            <span>{maxPrice}€</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
