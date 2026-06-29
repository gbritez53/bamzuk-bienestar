import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/dropea/products', () => ({
  listProducts: vi.fn(async () => ({
    items: [
      { id: '60', name: 'Test', sku: 'S', description: 'D', category: 'C',
        costPrice: 10, pvpr: 20, weightKg: 1, dimensions: { height: 1, width: 1, length: 1 },
        images: [], variants: [], isPublic: true },
    ],
    total: 1, currentPage: 1, lastPage: 1, perPage: 20,
  })),
}))

describe('sitemap', () => {
  it('incluye URLs para es y pt', async () => {
    const { default: sitemap } = await import('../sitemap')
    const urls = await sitemap()
    const hrefs = urls.map(u => u.url)
    expect(hrefs.some(u => u.includes('/es'))).toBe(true)
    expect(hrefs.some(u => u.includes('/pt'))).toBe(true)
  })

  it('incluye URL del producto en ambos locales', async () => {
    const { default: sitemap } = await import('../sitemap')
    const urls = await sitemap()
    const hrefs = urls.map(u => u.url)
    expect(hrefs.some(u => u.includes('/es/productos/60'))).toBe(true)
    expect(hrefs.some(u => u.includes('/pt/productos/60'))).toBe(true)
  })
})

describe('robots', () => {
  it('permite / y bloquea /api/', async () => {
    const { default: robots } = await import('../robots')
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
    expect(rules?.allow).toContain('/')
    expect(rules?.disallow).toContain('/api/')
  })

  it('incluye URL del sitemap', async () => {
    const { default: robots } = await import('../robots')
    const result = robots()
    expect(result.sitemap).toContain('sitemap.xml')
  })
})
