import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { nichoConfig } from '../../../nicho.config'
import ProductGrid from '@/components/catalog/ProductGrid'
import { listProducts } from '@/lib/dropea/products'

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

// Categorías populares — hoy son solo navegación visual hacia el catálogo
// general: Dropea no expone categorías de mascotas reales todavía (ver
// nicho.config.ts). Cuando se conecte el proveedor real, estos links podrán
// apuntar a un catálogo filtrado de verdad.
const POPULAR_CATEGORIES = [
  { key: 'dogs', bg: 'bg-primary-light' },
  { key: 'cats', bg: 'bg-secondary-light' },
  { key: 'birds', bg: 'bg-muted' },
  { key: 'smallPets', bg: 'bg-secondary-light' },
  { key: 'collars', bg: 'bg-muted' },
  { key: 'health', bg: 'bg-muted' },
] as const

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
        {/* Hero */}
        <section className="relative mt-6 flex flex-col overflow-hidden rounded-2xl bg-primary-light shadow-[var(--shadow-md)] md:min-h-[500px] md:flex-row md:items-center">
          {/* Desktop: banner con mascotas + corazones ya posicionados
              por el usuario, encima de todo el hero */}
          <div className="absolute inset-0 hidden md:block">
            <Image
              src="/banner-horizontal.png"
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 0px, 100vw"
              className="object-contain"
            />
          </div>

          {/* Mobile: huellas y corazones ya posicionados por el usuario,
              encima de todo el hero */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 md:hidden">
            <Image
              src="/banner-huellas.png"
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 0px"
              className="object-contain"
            />
          </div>

          <div className="relative z-10 max-w-xl space-y-5 p-8 sm:p-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/30 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary backdrop-blur-md">
              {t('badge')}
            </span>
            <h1 className="animate-slide-up font-heading text-4xl leading-tight font-extrabold text-secondary sm:text-5xl">
              {t('title')}
            </h1>
            <p
              className="animate-slide-up max-w-md text-base text-secondary/80 sm:text-lg"
              style={{ animationDelay: '0.1s' }}
            >
              {t('subtitle')}
            </p>
            <div
              className="animate-slide-up flex flex-wrap items-center gap-4 pt-2"
              style={{ animationDelay: '0.2s' }}
            >
              <Link
                href={`/${locale}/productos`}
                className="inline-flex items-center rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                {t('cta')}
              </Link>
              <Link
                href={`/${locale}/productos`}
                className="inline-flex items-center rounded-full border-2 border-primary px-7 py-3.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Mobile: mascotas apiladas debajo del texto, pegadas al borde
              inferior derecho (el corte del PNG queda oculto contra el borde) */}
          <div className="relative h-64 w-full sm:h-72 md:hidden">
            <Image
              src="/banner-mascotas.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-contain object-right-bottom"
            />
          </div>
        </section>

        {/* Categorías populares */}
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
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {POPULAR_CATEGORIES.map(({ key, bg }) => (
              <Link
                key={key}
                href={`/${locale}/productos`}
                className="group flex flex-col items-center gap-3 text-center"
              >
                <span
                  className={`flex h-28 w-28 items-center justify-center rounded-full ${bg} ring-4 ring-transparent transition-all group-hover:ring-primary-light`}
                >
                  <span className="text-4xl" aria-hidden="true">
                    {CATEGORY_EMOJI[key]}
                  </span>
                </span>
                <span className="font-heading text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                  {t(`category.${key}`)}
                </span>
              </Link>
            ))}
          </div>
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
      </div>
    </>
  )
}

const CATEGORY_EMOJI: Record<(typeof POPULAR_CATEGORIES)[number]['key'], string> = {
  dogs: '🐶',
  cats: '🐱',
  birds: '🐦',
  smallPets: '🐹',
  collars: '🦮',
  health: '💊',
}
