import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CartItem, CheckoutCustomer } from '@/lib/contracts'

const mockSendOrderConfirmationEmail = vi.fn()
const mockSendOwnerNewOrderEmail = vi.fn()
const mockIsProcessed = vi.fn()
const mockMarkProcessed = vi.fn()

vi.mock('@/lib/email/order-confirmation-email', () => ({
  sendOrderConfirmationEmail: (...args: unknown[]) => mockSendOrderConfirmationEmail(...args),
}))

vi.mock('@/lib/email/owner-new-order-email', () => ({
  sendOwnerNewOrderEmail: (...args: unknown[]) => mockSendOwnerNewOrderEmail(...args),
}))

vi.mock('@/lib/webhooks/idempotency', () => ({
  idempotencyStore: {
    isProcessed: (...args: unknown[]) => mockIsProcessed(...args),
    markProcessed: (...args: unknown[]) => mockMarkProcessed(...args),
  },
}))

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
  orderId: '1295211',
  reference: 'ORDER-ABC123',
  locale: 'es' as const,
  customer,
  items,
  paymentMethod: 'PAID' as const,
  subtotalCents: 3998,
  shippingEur: 4.99,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('OWNER_NOTIFICATION_EMAIL', 'owner@test.com')
  mockIsProcessed.mockResolvedValue(false)
  mockMarkProcessed.mockResolvedValue(undefined)
  mockSendOrderConfirmationEmail.mockResolvedValue(undefined)
  mockSendOwnerNewOrderEmail.mockResolvedValue(undefined)
})

describe('notifyOrderPlaced', () => {
  it('manda el mail al cliente y al dueño', async () => {
    const { notifyOrderPlaced } = await import('@/lib/email/order-notifications')
    await notifyOrderPlaced(baseInput)

    expect(mockSendOrderConfirmationEmail).toHaveBeenCalledTimes(1)
    expect(mockSendOwnerNewOrderEmail).toHaveBeenCalledTimes(1)
    expect(mockSendOwnerNewOrderEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'owner@test.com', orderId: baseInput.orderId }),
    )
  })

  it('si OWNER_NOTIFICATION_EMAIL no está seteada, loguea warn y no lanza ni afecta el mail al cliente', async () => {
    vi.stubEnv('OWNER_NOTIFICATION_EMAIL', '')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { notifyOrderPlaced } = await import('@/lib/email/order-notifications')
    await expect(notifyOrderPlaced(baseInput)).resolves.toBeUndefined()

    expect(mockSendOwnerNewOrderEmail).not.toHaveBeenCalled()
    expect(mockSendOrderConfirmationEmail).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
  })

  it('si falla el mail al cliente, no lanza y loguea; el mail al dueño igual sale', async () => {
    mockSendOrderConfirmationEmail.mockRejectedValue(new Error('Resend caído'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { notifyOrderPlaced } = await import('@/lib/email/order-notifications')
    await expect(notifyOrderPlaced(baseInput)).resolves.toBeUndefined()

    expect(mockSendOwnerNewOrderEmail).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })

  it('si falla el mail al dueño, no lanza y loguea; el mail al cliente igual sale', async () => {
    mockSendOwnerNewOrderEmail.mockRejectedValue(new Error('Resend caído'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { notifyOrderPlaced } = await import('@/lib/email/order-notifications')
    await expect(notifyOrderPlaced(baseInput)).resolves.toBeUndefined()

    expect(mockSendOrderConfirmationEmail).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })

  it('segunda invocación con el mismo orderId no reenvía (idempotencia)', async () => {
    const { notifyOrderPlaced } = await import('@/lib/email/order-notifications')

    mockIsProcessed.mockResolvedValueOnce(false)
    await notifyOrderPlaced(baseInput)
    expect(mockSendOrderConfirmationEmail).toHaveBeenCalledTimes(1)
    expect(mockMarkProcessed).toHaveBeenCalledWith(
      `order-notifications-sent:${baseInput.orderId}`,
      expect.any(Number),
    )

    mockIsProcessed.mockResolvedValueOnce(true)
    await notifyOrderPlaced(baseInput)
    expect(mockSendOrderConfirmationEmail).toHaveBeenCalledTimes(1)
    expect(mockSendOwnerNewOrderEmail).toHaveBeenCalledTimes(1)
  })

  it('nunca lanza, incluso si ambos mails fallan', async () => {
    mockSendOrderConfirmationEmail.mockRejectedValue(new Error('x'))
    mockSendOwnerNewOrderEmail.mockRejectedValue(new Error('y'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const { notifyOrderPlaced } = await import('@/lib/email/order-notifications')
    await expect(notifyOrderPlaced(baseInput)).resolves.toBeUndefined()
  })
})
