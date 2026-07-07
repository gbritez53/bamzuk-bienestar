import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/hooks/useCart', () => ({
  useCartStore: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    className,
  }: {
    href: string
    children: React.ReactNode
    onClick?: () => void
    className?: string
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}))

import { useCartStore } from '@/hooks/useCart'
import CartDrawer from '../CartDrawer'

const baseState = {
  items: [
    {
      productId: '1',
      variantId: null,
      name: 'Crema Hidratante',
      unitBasePrice: 2990,
      quantity: 1,
      imageUrl: null,
    },
  ],
  itemCount: 1,
  subtotalCents: 2990,
  updateQuantity: vi.fn(),
  removeItem: vi.fn(),
}

describe('CartDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCartStore).mockImplementation((selector: any) => selector(baseState))
  })

  it('links to the full cart page, not just checkout', () => {
    render(<CartDrawer open={true} onClose={() => {}} locale="es" />)
    const viewCartLink = screen.getByRole('link', { name: /viewCart/i })
    expect(viewCartLink).toHaveAttribute('href', '/es/carrito')
  })

  it('still links to checkout', () => {
    render(<CartDrawer open={true} onClose={() => {}} locale="es" />)
    const checkoutLink = screen.getByRole('link', { name: /checkout/i })
    expect(checkoutLink).toHaveAttribute('href', '/es/checkout')
  })

  it('does not show cart page or checkout links when the cart is empty', () => {
    vi.mocked(useCartStore).mockImplementation((selector: any) =>
      selector({ ...baseState, items: [], itemCount: 0, subtotalCents: 0 }),
    )
    render(<CartDrawer open={true} onClose={() => {}} locale="es" />)
    expect(screen.queryByRole('link', { name: /viewCart/i })).not.toBeInTheDocument()
  })
})
