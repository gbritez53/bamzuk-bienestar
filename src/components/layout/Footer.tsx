'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { nichoConfig } from '../../../nicho.config'

// Todos apuntan al catálogo general — Dropea no expone subcategorías reales
// (ver design's decisión #5: category-checkbox/brand-radio nunca se construyen).
const CATEGORY_LINKS = ['skincare', 'wellness', 'bodycare'] as const

export default function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('navigation')
  const params = useParams()
  const locale = (params.locale as string) || 'es'
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto w-full bg-secondary-light/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="space-y-3 md:col-span-1">
          <Image
            src="/logo-footer.png"
            alt={nichoConfig.name}
            width={5075}
            height={2128}
            className="h-16 w-auto"
          />
          <p className="max-w-xs text-sm text-muted-foreground">{t('tagline')}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold tracking-wider text-primary uppercase">
            {t('categories')}
          </h4>
          <ul className="space-y-2">
            {CATEGORY_LINKS.map(key => (
              <li key={key}>
                <Link
                  href={`/${locale}/productos`}
                  className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
                >
                  {tNav(key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold tracking-wider text-primary uppercase">
            {t('quickLinks')}
          </h4>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}/aviso-legal`}
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
              >
                {t('avisoLegal')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/privacidad`}
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
              >
                {t('privacidad')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/devoluciones`}
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
              >
                {t('devoluciones')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/cookies`}
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
              >
                {t('cookies')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold tracking-wider text-primary uppercase">
            {t('newsletter')}
          </h4>
          <p className="text-xs text-muted-foreground">{t('newsletterHint')}</p>
        </div>
      </div>

      <div className="border-t border-border px-4 py-5 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {year} {nichoConfig.name}. {t('rightsReserved')}
        </p>
      </div>
    </footer>
  )
}
