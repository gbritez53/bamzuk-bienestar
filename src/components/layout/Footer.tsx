'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { nichoConfig } from '../../../nicho.config'

export default function Footer() {
  const t = useTranslations('footer')
  const params = useParams()
  const locale = (params.locale as string) || 'es'
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-gradient-to-r from-primary/5 via-background to-secondary/5">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {year}{' '}
            <span className="font-semibold" style={{ color: nichoConfig.colors.primary }}>
              {nichoConfig.name}
            </span>
          </p>
          <nav className="flex flex-wrap gap-6">
            <Link
              href={`/${locale}/aviso-legal`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('avisoLegal')}
            </Link>
            <Link
              href={`/${locale}/privacidad`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('privacidad')}
            </Link>
            <Link
              href={`/${locale}/devoluciones`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('devoluciones')}
            </Link>
            <Link
              href={`/${locale}/cookies`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('cookies')}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
