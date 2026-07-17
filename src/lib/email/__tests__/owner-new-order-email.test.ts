import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Resend } from 'resend'
import type { CartItem, CheckoutCustomer } from '@/lib/contracts'
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

const customer: CheckoutCustomer = {
  firstName: 'Daniel',
  lastName: 'Longone',
  email: 'cliente@test.com',
  phone: '+34600000000',
  address: { line: 'Calle Falsa 123', city: 'Madrid', postalCode: '28001', country: 'ES' },
}

const baseInput = {
  to: 'owner@test.com',
  orderId: '1295211',
  reference: 'ORDER-ABC123',
  customer,
  items,
  subtotalCents: 3998,
  shippingEur: 4.99,
  paymentMethod: 'PAID' as const,
}

describe('sendOwnerNewOrderEmail', () => {
  it('manda el mail al dueño con destinatario y subject', async () => {
    const { sendOwnerNewOrderEmail } = await import('@/lib/email/owner-new-order-email')
    await sendOwnerNewOrderEmail(baseInput)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'pedidos@test.com',
        to: 'owner@test.com',
        subject: expect.stringContaining('pedido'),
      }),
    )
  })

  it('el HTML incluye datos del cliente, dirección, líneas, método de pago, total, orderId y reference', async () => {
    const { sendOwnerNewOrderEmail } = await import('@/lib/email/owner-new-order-email')
    await sendOwnerNewOrderEmail(baseInput)
    const call = mockSend.mock.calls[0]?.[0]
    expect(call.html).toContain('Daniel')
    expect(call.html).toContain('Longone')
    expect(call.html).toContain('cliente@test.com')
    expect(call.html).toContain('+34600000000')
    expect(call.html).toContain('Calle Falsa 123')
    expect(call.html).toContain('Madrid')
    expect(call.html).toContain('28001')
    expect(call.html).toContain('Almohada Cervical')
    expect(call.html).toContain('PAID')
    expect(call.html).toContain(baseInput.orderId)
    expect(call.html).toContain(baseInput.reference)
    // total = 39.98 + 4.99 = 44.97
    expect(call.html).toContain('44,97')
  })

  it('lanza error si RESEND_FROM_EMAIL no está seteado', async () => {
    vi.stubEnv('RESEND_FROM_EMAIL', '')
    const { sendOwnerNewOrderEmail } = await import('@/lib/email/owner-new-order-email')
    await expect(sendOwnerNewOrderEmail(baseInput)).rejects.toThrow('RESEND_FROM_EMAIL')
  })

  it('lanza error si Resend devuelve error', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Invalid from address' } })
    const { sendOwnerNewOrderEmail } = await import('@/lib/email/owner-new-order-email')
    await expect(sendOwnerNewOrderEmail(baseInput)).rejects.toThrow('Invalid from address')
  })
})
