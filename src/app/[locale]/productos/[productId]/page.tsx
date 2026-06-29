import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/dropea/products'
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

  const product = await getProductById(id)
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

  const product = await getProductById(id)
  if (!product) notFound()

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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href={`/${locale}/productos`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        ← Volver al catálogo
      </Link>
      <ProductDetail product={product} locale={locale} />
    </main>
  )
}
