'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { routing } from '@/i18n/routing'

export default function LanguageSwitcher() {
  const t = useTranslations('language')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const segments = pathname.split('/')
  const currentLocale = segments[1]
  const query = searchParams.toString()

  function hrefForLocale(locale: string): string {
    const next = [...segments]
    next[1] = locale
    const path = next.join('/') || '/'
    return query ? `${path}?${query}` : path
  }

  return (
    <div
      role="group"
      aria-label={t('selectorLabel')}
      className="flex items-center gap-0.5 rounded-full border border-border bg-muted p-0.5 text-xs font-bold"
    >
      {routing.locales.map(locale => (
        <Link
          key={locale}
          href={hrefForLocale(locale)}
          scroll={false}
          aria-label={t(locale)}
          aria-current={locale === currentLocale ? 'true' : undefined}
          className={`cursor-pointer rounded-full px-2.5 py-1 uppercase transition-colors ${
            locale === currentLocale
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-primary'
          }`}
        >
          {locale}
        </Link>
      ))}
    </div>
  )
}
