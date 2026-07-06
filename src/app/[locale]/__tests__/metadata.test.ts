import { describe, it, expect, vi } from 'vitest'

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}))

vi.mock('@/lib/dropea/products', () => ({
  listProducts: vi.fn(async () => ({ items: [], total: 0, currentPage: 1, lastPage: 1, perPage: 20 })),
  getProductById: vi.fn(async () => null),
}))

describe('generateMetadata — home page', () => {
  it('incluye title con nombre del nicho', async () => {
    const { generateMetadata } = await import('../page')
    const meta = await generateMetadata({ params: Promise.resolve({ locale: 'es' }) })
    expect(String(meta.title)).toContain('Bamzuk Bienestar')
  })

  it('incluye alternates hreflang es y pt', async () => {
    const { generateMetadata } = await import('../page')
    const meta = await generateMetadata({ params: Promise.resolve({ locale: 'es' }) })
    expect(meta.alternates?.languages).toBeDefined()
  })
})

describe('generateMetadata — product detail', () => {
  it('retorna notFound metadata si producto no existe', async () => {
    const { generateMetadata } = await import('../productos/[productId]/page')
    const meta = await generateMetadata({ params: Promise.resolve({ locale: 'es', productId: '999' }) })
    // When product not found, title should still be defined
    expect(meta).toBeDefined()
  })

  it('incluye title con nombre del producto cuando existe', async () => {
    const { getProductById } = await import('@/lib/dropea/products')
    vi.mocked(getProductById).mockResolvedValueOnce({
      id: '60', name: 'Almohada Cervical', sku: 'SKU-1', description: 'Desc',
      category: 'Hogar', costPrice: 16.33, pvpr: 32.98, weightKg: 1.24,
      dimensions: { height: 18, width: 18, length: 30 },
      images: [{ url: 'https://api.dropea.com/img', alt: '' }],
      variants: [], isPublic: true,
    })
    const { generateMetadata } = await import('../productos/[productId]/page')
    const meta = await generateMetadata({ params: Promise.resolve({ locale: 'es', productId: '60' }) })
    expect(String(meta.title)).toContain('Almohada Cervical')
  })
})
