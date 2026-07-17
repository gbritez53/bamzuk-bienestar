import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Resend } from 'resend'
import type { CartItem } from '@/lib/contracts'
import { __setResendClient } from '@/lib/email/resend'

const mockSend = vi.fn()
const mockClient = { emails: { send: mockSend } } as unknown as Resend

beforeEach(() => {
  mockSend.mockReset()
  mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null })
  __setResendClient(mockClient)
  vi.stubEnv('RESEND_FROM_EMAIL', 'pedidos@test.com')
})

const items: CartItem[] = [
  {
    productId: '1',
    variantId: null,
    name: 'Almohada Cervical',
    unitBasePrice: 1999,
    weightKg: 0.3,
    dimensions: null,
    imageUrl: null,
    quantity: 2,
  },
]

const baseInput = {
  to: 'cliente@test.com',
  customerName: 'Daniel Longone',
  orderId: '1295211',
  items,
  subtotalCents: 3998,
  shippingEur: 4.99,
  paymentMethod: 'PAID' as const,
  locale: 'es' as const,
}

describe('sendOrderConfirmationEmail', () => {
  it('manda el mail con destinatario y subject bilingüe en es', async () => {
    const { sendOrderConfirmationEmail } = await import('@/lib/email/order-confirmation-email')
    await sendOrderConfirmationEmail(baseInput)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'pedidos@test.com',
        to: 'cliente@test.com',
        subject: expect.stringContaining('pedido'),
      }),
    )
  })

  it('subject en pt cuando locale es pt', async () => {
    const { sendOrderConfirmationEmail } = await import('@/lib/email/order-confirmation-email')
    await sendOrderConfirmationEmail({ ...baseInput, locale: 'pt' })
    const call = mockSend.mock.calls[0]?.[0]
    expect(call.subject).toContain('pedido')
  })

  it('el HTML incluye el código de pedido, el detalle de ítems y el total', async () => {
    const { sendOrderConfirmationEmail } = await import('@/lib/email/order-confirmation-email')
    await sendOrderConfirmationEmail(baseInput)
    const call = mockSend.mock.calls[0]?.[0]
    expect(call.html).toContain(baseInput.orderId)
    expect(call.html).toContain('Almohada Cervical')
    // total = subtotal (39.98) + shipping (4.99) = 44.97
    expect(call.html).toContain('44,97')
  })

  it('incluye nota de pago en efectivo solo si paymentMethod es CASH_ON_DELIVERY', async () => {
    const { sendOrderConfirmationEmail } = await import('@/lib/email/order-confirmation-email')

    await sendOrderConfirmationEmail(baseInput)
    const paidCall = mockSend.mock.calls[0]?.[0]
    expect(paidCall.html).not.toMatch(/efectivo|contrareembolso/i)

    mockSend.mockClear()
    await sendOrderConfirmationEmail({ ...baseInput, paymentMethod: 'CASH_ON_DELIVERY' })
    const codCall = mockSend.mock.calls[0]?.[0]
    expect(codCall.html).toMatch(/efectivo/i)
  })

  it('lanza error si RESEND_FROM_EMAIL no está seteado', async () => {
    vi.stubEnv('RESEND_FROM_EMAIL', '')
    const { sendOrderConfirmationEmail } = await import('@/lib/email/order-confirmation-email')
    await expect(sendOrderConfirmationEmail(baseInput)).rejects.toThrow('RESEND_FROM_EMAIL')
  })

  it('lanza error si Resend devuelve error', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Invalid from address' } })
    const { sendOrderConfirmationEmail } = await import('@/lib/email/order-confirmation-email')
    await expect(sendOrderConfirmationEmail(baseInput)).rejects.toThrow('Invalid from address')
  })
})
