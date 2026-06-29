import type { Metadata } from 'next'
import { listProducts } from '@/lib/dropea/products'
import ProductGrid from '@/components/catalog/ProductGrid'
import Pagination from '@/components/catalog/Pagination'
import { getTranslations } from 'next-intl/server'
import { nichoConfig } from '../../../../nicho.config'

export const revalidate = 3600
const PAGE_SIZE = 40

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
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const currentPage = Math.max(1, Number(sp.page) || 1)
  const t = await getTranslations({ locale, namespace: 'products' })
  const category = nichoConfig.category || undefined
  const { items, total, lastPage } = await listProducts(currentPage, PAGE_SIZE, undefined, category)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        {category && (
          <span className="rounded-full bg-primary-light px-3.5 py-1 text-xs font-medium text-primary">
            {category}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-muted-foreground">
            No hay productos disponibles en esta categoría.
          </p>
        </div>
      ) : (
        <>
          <ProductGrid products={items} locale={locale} />
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            basePath={`/${locale}/productos`}
            total={total}
            pageSize={PAGE_SIZE}
          />
        </>
      )}
    </main>
  )
}
