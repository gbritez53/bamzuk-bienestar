import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Header from '@/components/layout/Header'
import { useCartStore } from '@/hooks/useCart'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'es' }),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    'aria-label': ariaLabel,
  }: {
    href: string
    children: React.ReactNode
    className?: string
    'aria-label'?: string
  }) => (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}))

vi.mock('@/hooks/useCart', () => ({
  useCartStore: vi.fn(() => ({ itemCount: 0 })),
}))

beforeEach(() => {
  vi.mocked(useCartStore).mockReturnValue({ itemCount: 0 })
})

describe('Header', () => {
  it('renders and shows the site name', () => {
    render(<Header />)
    expect(screen.getByText('Mi Tienda')).toBeInTheDocument()
  })

  it('has a link to the products page with locale prefix', () => {
    render(<Header />)
    const link = screen.getByRole('link', { name: /products/i })
    expect(link).toHaveAttribute('href', '/es/productos')
  })

  it('has a cart button that opens the drawer', () => {
    render(<Header />)
    expect(
      screen.getByRole('button', { name: /abrir carrito/i }),
    ).toBeInTheDocument()
  })

  it('shows 0 cart items in the badge by default', () => {
    render(<Header />)
    const cartButton = screen.getByRole('button', { name: /abrir carrito/i })
    expect(cartButton).toHaveTextContent('0')
  })

  it('shows updated cart item count when store has items', () => {
    vi.mocked(useCartStore).mockReturnValue({ itemCount: 5 })
    render(<Header />)
    const cartButton = screen.getByRole('button', { name: /abrir carrito/i })
    expect(cartButton).toHaveTextContent('5')
  })
})
