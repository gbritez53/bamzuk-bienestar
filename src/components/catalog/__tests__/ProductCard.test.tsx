import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProductCard from '../ProductCard'
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

const product: Product = {
  id: '60',
  name: 'Almohada Cervical',
  sku: 'V0103849',
  description: 'Una almohada ergonómica',
  category: 'Hogar',
  costPrice: 16.33,
  pvpr: 32.98,
  weightKg: 1.24,
  dimensions: { height: 18, width: 18, length: 30 },
  images: [{ url: 'https://api.dropea.com/img', alt: 'Almohada' }],
  variants: [],
  isPublic: true,
}

describe('ProductCard', () => {
  it('muestra el nombre del producto', () => {
    render(<ProductCard product={product} locale="es" />)
    expect(screen.getByText('Almohada Cervical')).toBeInTheDocument()
  })

  it('muestra el precio pvpr formateado', () => {
    render(<ProductCard product={product} locale="es" />)
    expect(screen.getByText(/32[,.]98/)).toBeInTheDocument()
  })

  it('link apunta a /es/productos/60', () => {
    render(<ProductCard product={product} locale="es" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/es/productos/60')
  })

  it('muestra la imagen con alt del nombre del producto', () => {
    render(<ProductCard product={product} locale="es" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Almohada Cervical')
  })

  it('muestra icono placeholder cuando no hay imagen', () => {
    render(<ProductCard product={{ ...product, images: [] }} locale="es" />)
    // Should render an SVG icon instead of img
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // The card still renders with the product info
    expect(screen.getByText('Almohada Cervical')).toBeInTheDocument()
  })
})
