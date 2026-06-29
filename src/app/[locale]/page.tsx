import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { nichoConfig } from '../../../nicho.config'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = nichoConfig.domain

  return {
    title: nichoConfig.name,
    description: `Tienda online de ${nichoConfig.name}. Los mejores productos con envío rápido.`,
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'es': `${siteUrl}/es`,
        'pt': `${siteUrl}/pt`,
      },
    },
    openGraph: {
      type: 'website',
      url: `${siteUrl}/${locale}`,
      title: nichoConfig.name,
      description: `Tienda online de ${nichoConfig.name}.`,
      siteName: nichoConfig.name,
    },
  }
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })

  // JSON-LD: Organization schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: nichoConfig.name,
    url: nichoConfig.domain,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-gray-600">{t('subtitle')}</p>
        <div className="mt-8">
          <Link
            href={`/${locale}/productos`}
            className="inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700"
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </div>
  )
}
