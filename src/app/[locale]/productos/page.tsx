import type { Metadata } from 'next'
import { listProducts } from '@/lib/dropea/products'
import ProductGrid from '@/components/catalog/ProductGrid'
import { getTranslations } from 'next-intl/server'
import { nichoConfig } from '../../../../nicho.config'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = nichoConfig.domain
  const title = `Catálogo — ${nichoConfig.name}`

  return {
    title,
    description: `Descubrí todos los productos de ${nichoConfig.name} con envío rápido a España y Portugal.`,
    alternates: {
      canonical: `${siteUrl}/${locale}/productos`,
      languages: {
        'es': `${siteUrl}/es/productos`,
        'pt': `${siteUrl}/pt/productos`,
      },
    },
    openGraph: {
      type: 'website',
      url: `${siteUrl}/${locale}/productos`,
      title,
      siteName: nichoConfig.name,
    },
  }
}

export default async function ProductosPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'products' })
  const { items } = await listProducts(1, 40)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t('title')}</h1>
      <ProductGrid products={items} locale={locale} />
    </main>
  )
}
