'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { routing } from '@/i18n/routing'

const FLAGS: Record<string, string> = {
  es: '/flags/es.webp',
  pt: '/flags/pt.png',
}

/**
 * Botón circular con la bandera del idioma actual + dropdown — mismo patrón
 * de web-la-rueca (LanguageSwitcher.tsx), adaptado a este proyecto:
 * - Colores: tokens de bamzuk (--primary/--border/--card) en vez de los hex
 *   propios de la_rueca (no tenía sentido traer su paleta oscura verde/crema).
 * - Navegación: next/navigation `router.push` (SPA, sin reload) en vez de
 *   `window.location.href` — la_rueca lo necesitaba por su routing de Astro,
 *   acá next-intl ya maneja el locale-aware routing del lado del cliente.
 */
export default function LanguageSwitcher() {
  const t = useTranslations('language')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const segments = pathname.split('/')
  const currentLocale = segments[1] ?? routing.defaultLocale
  const query = searchParams.toString()

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)

  function hrefForLocale(locale: string): string {
    const next = [...segments]
    next[1] = locale
    const path = next.join('/') || '/'
    return query ? `${path}?${query}` : path
  }

  function select(locale: string) {
    setOpen(false)
    router.push(hrefForLocale(locale))
  }

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setActiveIndex(routing.locales.findIndex(l => l === currentLocale))
    } else {
      setActiveIndex(-1)
    }
  }, [open, currentLocale])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        setOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => (prev + 1) % routing.locales.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => (prev - 1 + routing.locales.length) % routing.locales.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < routing.locales.length) {
          select(routing.locales[activeIndex]!)
        }
        break
    }
  }

  return (
    <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger — círculo con la bandera actual */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={`${t('selectorLabel')}: ${t(currentLocale)}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 bg-transparent p-0 transition-colors duration-200 ${
          open ? 'border-primary' : 'border-border hover:border-primary/50'
        }`}
      >
        <Image
          src={FLAGS[currentLocale] ?? FLAGS[routing.defaultLocale]!}
          alt={t(currentLocale)}
          width={32}
          height={32}
          className="block h-full w-full object-cover"
        />
      </button>

      {/* Dropdown */}
      <ul
        role="listbox"
        aria-label={t('selectorLabel')}
        aria-activedescendant={
          activeIndex >= 0 ? `lang-option-${routing.locales[activeIndex]}` : undefined
        }
        tabIndex={-1}
        className={`absolute top-full right-0 z-50 mt-2 min-w-40 list-none rounded-lg border border-border bg-card py-1.5 shadow-[var(--shadow-lg)] transition-all duration-150 ${
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1.5 opacity-0'
        }`}
      >
        {routing.locales.map((locale, i) => {
          const isSelected = locale === currentLocale
          const isActive = i === activeIndex
          return (
            <li key={locale} id={`lang-option-${locale}`} role="option" aria-selected={isSelected}>
              <button
                onClick={() => select(locale)}
                className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors duration-150 ${
                  isSelected
                    ? 'bg-primary-light/40 font-semibold text-primary'
                    : isActive
                      ? 'bg-muted font-normal text-primary'
                      : 'font-normal text-foreground hover:bg-muted hover:text-primary'
                }`}
              >
                <Image
                  src={FLAGS[locale]!}
                  alt=""
                  aria-hidden="true"
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                />
                {t(locale)}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
