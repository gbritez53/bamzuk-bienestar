import type { MetadataRoute } from 'next'
import { listProducts } from '@/lib/dropea/products'
import { nichoConfig } from '../../nicho.config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = nichoConfig.domain
  const locales = ['es', 'pt'] as const

  const staticUrls: MetadataRoute.Sitemap = locales.flatMap(locale => [
    {
      url: `${siteUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/${locale}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ])

  let productUrls: MetadataRoute.Sitemap = []
  try {
    const { items } = await listProducts(1, 200)
    productUrls = items.flatMap(product =>
      locales.map(locale => ({
        url: `${siteUrl}/${locale}/productos/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    )
  } catch {
    // Si Dropea no está disponible en build time, el sitemap solo tendrá URLs estáticas
  }

  return [...staticUrls, ...productUrls]
}
