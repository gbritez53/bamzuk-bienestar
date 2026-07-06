import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { nichoConfig } from '../../../nicho.config'
import ProductGrid from '@/components/catalog/ProductGrid'
import { listProducts } from '@/lib/dropea/products'
import HomeHero from '@/components/home/HomeHero'
import CategoryBento from '@/components/home/CategoryBento'
import ValuesSection from '@/components/home/ValuesSection'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = nichoConfig.domain

  return {
    title: nichoConfig.name,
    description: `Descubrí los mejores productos de ${nichoConfig.name} con envío rápido a España y Portugal.`,
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        es: `${siteUrl}/es`,
        pt: `${siteUrl}/pt`,
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
  const { items: featured } = await listProducts(1, 8, undefined, nichoConfig.category || undefined, locale)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: nichoConfig.name,
    url: nichoConfig.domain,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6">
          <HomeHero locale={locale} t={t} />
        </div>

        {/* Categorías destacadas */}
        <section className="mt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                {t('categoriesTitle')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('categoriesSubtitle')}</p>
            </div>
            <Link
              href={`/${locale}/productos`}
              className="hidden shrink-0 text-sm font-semibold text-primary hover:underline sm:inline-flex sm:items-center sm:gap-1"
            >
              {t('categoriesCta')} →
            </Link>
          </div>
          <CategoryBento locale={locale} t={t} />
        </section>

        {/* Destacados */}
        <section className="mt-16 mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {t('featuredTitle')}
            </h2>
            <Link
              href={`/${locale}/productos`}
              className="text-sm font-semibold text-primary transition-colors hover:underline"
            >
              {t('featuredCta')} →
            </Link>
          </div>
          <ProductGrid products={featured} locale={locale} />
        </section>

        {/* Valores de marca */}
        <section className="mb-20">
          <ValuesSection t={t} />
        </section>
      </div>
    </>
  )
}
