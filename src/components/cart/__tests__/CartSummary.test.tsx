import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/hooks/useCart', () => ({
  useCartStore: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { useCartStore } from '@/hooks/useCart'
import CartSummary from '../CartSummary'

describe('CartSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra subtotal en EUR', () => {
    vi.mocked(useCartStore).mockImplementation((selector: any) =>
      selector({ items: [], itemCount: 0, subtotalCents: 3298 }),
    )
    render(<CartSummary shippingEur={3.68} isFreeShipping={false} locale="es" />)
    expect(screen.getByText(/32[,.]98/)).toBeInTheDocument()
  })

  it('muestra envío gratis cuando aplica', () => {
    vi.mocked(useCartStore).mockImplementation((selector: any) =>
      selector({ items: [], itemCount: 0, subtotalCents: 5000 }),
    )
    render(<CartSummary shippingEur={0} isFreeShipping={true} locale="es" />)
    expect(screen.getByText(/freeShipping/i)).toBeInTheDocument()
  })
})
