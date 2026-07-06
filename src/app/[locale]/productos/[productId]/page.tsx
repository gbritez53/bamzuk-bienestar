import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getProductById, listProducts, categoryMatches } from '@/lib/dropea/products'
import ProductDetail from '@/components/product/ProductDetail'
import { nichoConfig } from '../../../../../nicho.config'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string; locale: string }>
}): Promise<Metadata> {
  const { productId, locale } = await params
  const id = parseInt(productId, 10)
  if (isNaN(id)) return { title: nichoConfig.name }

  const product = await getProductById(id, locale)
  if (!product) return { title: nichoConfig.name }

  const siteUrl = nichoConfig.domain
  const image = product.images[0]
  const title = `${product.name} — ${nichoConfig.name}`

  return {
    title,
    description: product.description.slice(0, 160),
    alternates: {
      canonical: `${siteUrl}/${locale}/productos/${productId}`,
      languages: {
        'es': `${siteUrl}/es/productos/${productId}`,
        'pt': `${siteUrl}/pt/productos/${productId}`,
      },
    },
    openGraph: {
      type: 'website',
      url: `${siteUrl}/${locale}/productos/${productId}`,
      title,
      description: product.description.slice(0, 160),
      images: image ? [{ url: image.url, alt: product.name }] : [],
      siteName: nichoConfig.name,
    },
  }
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ productId: string; locale: string }>
}) {
  const { productId, locale } = await params
  const id = parseInt(productId, 10)
  if (isNaN(id)) notFound()

  const product = await getProductById(id, locale)
  if (!product) notFound()
  // Productos fuera del nicho o sin precio de venta (pvpr=0) no existen
  // para esta tienda, ni siquiera por URL directa.
  // `nichoConfig.category` puede ser una lista separada por coma (ver
  // categoryMatches en lib/dropea/products) — no una igualdad exacta.
  const outsideNicho = !categoryMatches(product.category, nichoConfig.category)
  if (outsideNicho || product.pvpr <= 0) notFound()

  // Productos relacionados: misma categoría, excluyendo el actual (máx 4 —
  // "Completa tu Rutina", ver spec product-detail). Se piden 5 para
  // garantizar 4 tras excluir el producto actual (si Dropea lo incluyera).
  let relatedProducts: import('@/lib/dropea/types').Product[] = []
  if (product.category) {
    const relatedPage = await listProducts(1, 5, undefined, product.category, locale)
    relatedProducts = relatedPage.items.filter(p => p.id !== product.id).slice(0, 4)
  }

  const t = await getTranslations({ locale, namespace: 'productDetail' })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map(img => img.url),
    offers: {
      '@type': 'Offer',
      price: product.pvpr.toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: nichoConfig.name },
    },
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={`/${locale}`} className="cursor-pointer transition-colors hover:text-primary">
          {t('breadcrumbHome')}
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${locale}/productos`} className="cursor-pointer transition-colors hover:text-primary">
          {t('breadcrumbCatalog')}
        </Link>
        {product.category && (
          <>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-primary">{product.category}</span>
          </>
        )}
      </nav>
      <ProductDetail product={product} locale={locale} relatedProducts={relatedProducts} />
    </main>
  )
}
