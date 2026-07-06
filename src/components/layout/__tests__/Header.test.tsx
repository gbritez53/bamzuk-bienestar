import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Header from '@/components/layout/Header'
import { useCartStore } from '@/hooks/useCart'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'es' }),
  usePathname: () => '/es',
  useSearchParams: () => new URLSearchParams(),
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
  it('renders the logo with the site name as alt text', () => {
    render(<Header />)
    const logo = screen.getByAltText('Bamzuk Bienestar')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/logo.png')
  })

  it('has a link to the products page with locale prefix', () => {
    render(<Header />)
    const link = screen.getByRole('link', { name: /shopAll/i })
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
