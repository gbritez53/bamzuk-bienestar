import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { nichoConfig } from '../../../nicho.config'
import ProductGrid from '@/components/catalog/ProductGrid'
import { listProducts } from '@/lib/dropea/products'
import { Separator } from '@/components/ui/separator'

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
  const { items: featured } = await listProducts(1, 8)

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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent to-secondary/5">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="animate-slide-up text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('title', { storeName: nichoConfig.name })}
            </h1>
            <p className="animate-slide-up mt-4 text-lg text-muted-foreground" style={{ animationDelay: '0.1s' }}>
              {t('subtitle')}
            </p>
            <div className="animate-slide-up mt-8 flex items-center justify-center gap-4" style={{ animationDelay: '0.2s' }}>
              <Link
                href={`/${locale}/productos`}
                className="inline-flex items-center rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                {t('cta')}
              </Link>
            </div>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Productos destacados</h2>
          <Link
            href={`/${locale}/productos`}
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Ver todos →
          </Link>
        </div>
        <ProductGrid products={featured} locale={locale} />
      </section>

      {/* Trust bar */}
      <section className="border-t border-border bg-gradient-to-r from-primary/5 via-accent to-secondary/5">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { icon: '🚚', title: 'Envío rápido', desc: '24-48h' },
              { icon: '💳', title: 'Pago seguro', desc: 'SumUp protegido' },
              { icon: '🔄', title: 'Devoluciones', desc: '14 días' },
              { icon: '💬', title: 'Soporte', desc: 'Respuesta rápida' },
            ].map(item => (
              <div key={item.title} className="text-center">
                <div className="text-2xl">{item.icon}</div>
                <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
