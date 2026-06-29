'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { nichoConfig } from '../../../nicho.config'

export default function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Brand & copyright */}
          <p className="text-sm text-gray-500">
            &copy; {year} {nichoConfig.name}
          </p>

          {/* Legal links */}
          <nav className="flex flex-wrap gap-4">
            <Link
              href="/aviso-legal"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              {t('avisoLegal')}
            </Link>
            <Link
              href="/privacidad"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              {t('privacidad')}
            </Link>
            <Link
              href="/devoluciones"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              {t('devoluciones')}
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              {t('cookies')}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
