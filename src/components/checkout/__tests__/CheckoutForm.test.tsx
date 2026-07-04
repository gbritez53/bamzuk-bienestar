import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CheckoutForm from '../CheckoutForm'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/hooks/useCart', () => ({
  useCartStore: vi.fn((sel: any) =>
    sel({
      items: [
        {
          productId: '1',
          name: 'Test',
          unitBasePrice: 3298,
          quantity: 1,
          weightKg: 1,
          dimensions: null,
          imageUrl: null,
          variantId: null,
        },
      ],
      itemCount: 1,
      subtotalCents: 3298,
      clearCart: vi.fn(),
    }),
  ),
}))

describe('CheckoutForm', () => {
  it('renderiza los campos requeridos, con nombre y apellido separados', () => {
    render(<CheckoutForm locale="es" />)
    expect(screen.getByLabelText(/^firstName$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^lastName$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument()
  })

  it('botón de submit existe', () => {
    render(<CheckoutForm locale="es" />)
    expect(screen.getByRole('button', { name: /pay/i })).toBeInTheDocument()
  })
})
