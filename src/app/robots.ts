import type { MetadataRoute } from 'next'
import { nichoConfig } from '../../nicho.config'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = nichoConfig.domain
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/es/checkout/', '/pt/checkout/', '/es/carrito/', '/pt/carrito/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
