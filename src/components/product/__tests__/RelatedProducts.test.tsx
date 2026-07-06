import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RelatedProducts from '../RelatedProducts'
import type { Product } from '@/lib/dropea/types'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/hooks/useCart', () => ({
  useCartStore: vi.fn(() => () => {}),
}))

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: '1',
    name: 'Producto',
    sku: 'SKU1',
    description: 'desc',
    category: 'Belleza',
    costPrice: 10,
    pvpr: 20,
    weightKg: 0.5,
    dimensions: { height: 1, width: 1, length: 1 },
    images: [],
    variants: [],
    isPublic: true,
    ...overrides,
  }
}

describe('RelatedProducts', () => {
  it('renders the "Completa tu Rutina" section title and up to 4 product cards', () => {
    const products = [1, 2, 3, 4, 5].map(n => makeProduct({ id: String(n), name: `Producto ${n}` }))
    render(<RelatedProducts products={products} locale="es" title="Completa tu Rutina" />)
    expect(screen.getByText('Completa tu Rutina')).toBeInTheDocument()
    expect(screen.getAllByRole('link').length).toBeLessThanOrEqual(4 * 2) // card + add-to-cart aren't links, just guard upper bound
    expect(screen.getByText('Producto 1')).toBeInTheDocument()
    expect(screen.getByText('Producto 4')).toBeInTheDocument()
    expect(screen.queryByText('Producto 5')).not.toBeInTheDocument()
  })

  it('shows all available products with no blank placeholders when fewer than 4 exist', () => {
    const products = [1, 2].map(n => makeProduct({ id: String(n), name: `Producto ${n}` }))
    render(<RelatedProducts products={products} locale="es" title="Completa tu Rutina" />)
    expect(screen.getByText('Producto 1')).toBeInTheDocument()
    expect(screen.getByText('Producto 2')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2, name: 'Completa tu Rutina' })).toHaveLength(1)
  })

  it('omits the entire section when there are zero related products', () => {
    const { container } = render(<RelatedProducts products={[]} locale="es" title="Completa tu Rutina" />)
    expect(container).toBeEmptyDOMElement()
  })
})
