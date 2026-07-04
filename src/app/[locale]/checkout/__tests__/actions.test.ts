import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GraphQLClient } from 'graphql-request'
import { __setDropeaClient } from '@/lib/dropea/client'
import type { CartItem } from '@/lib/contracts'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
  vi.unstubAllEnvs()
  vi.stubEnv('SUMUP_API_KEY', 'test-key')
  vi.stubEnv('SUMUP_MERCHANT_CODE', 'merchant@test.com')
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://test.com')
})

describe('createSumUpCheckout', () => {
  it('llama a SumUp API con los datos correctos', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'checkout-123', status: 'PENDING' }),
    })
    const { createSumUpCheckout } = await import('../actions')
    const result = await createSumUpCheckout({
      amountEur: 32.98,
      reference: 'ORDER-abc',
      description: 'Test order',
      returnUrl: 'https://test.com/es/checkout/confirmacion?id=checkout-123',
    })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.sumup.com/v0.1/checkouts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-key' }),
      }),
    )
    expect(result.checkoutId).toBe('checkout-123')
  })

  it('lanza error si SumUp responde con error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid amount' }),
    })
    const { createSumUpCheckout } = await import('../actions')
    await expect(
      createSumUpCheckout({
        amountEur: 0,
        reference: 'ORDER-x',
        description: 'Test',
        returnUrl: 'http://test.com/confirmacion?id=x',
      }),
    ).rejects.toThrow()
  })
})

describe('verifySumUpPayment', () => {
  it('retorna status PAID cuando SumUp confirma', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'checkout-123', status: 'PAID' }),
    })
    const { verifySumUpPayment } = await import('../actions')
    const result = await verifySumUpPayment('checkout-123')
    expect(result.status).toBe('PAID')
  })
})

// ── Órdenes Dropea ──────────────────────────────────────────────────────────
// Formato real de la API (knowledge/order_create_mutation.md): las mutations
// NO reciben objeto "input" — los campos van como argumentos sueltos.

const mockDropeaRequest = vi.fn()
const mockDropeaClient = { request: mockDropeaRequest } as unknown as GraphQLClient

const cartItem: CartItem = {
  productId: '5227',
  variantId: null,
  name: 'Botella de agua plegable para mascotas',
  unitBasePrice: 2999, // céntimos
  weightKg: 0.3,
  dimensions: null,
  imageUrl: null,
  quantity: 2,
}

const customer = {
  firstName: 'Juan',
  lastName: 'Pérez García',
  email: 'juan@example.com',
  phone: '+34600000000',
  address: {
    line: 'Calle Falsa 123',
    city: 'Madrid',
    postalCode: '28001',
    country: 'ES' as const,
  },
}

describe('createDropeaOrder', () => {
  beforeEach(() => {
    vi.stubEnv('DROPEA_SHOP_ID', '17593')
    mockDropeaRequest.mockReset()
    mockDropeaRequest.mockResolvedValue({
      orderCreate: { id: '9001', status: 'PENDING', total_amount: 59.98 },
    })
    __setDropeaClient(mockDropeaClient)
  })

  it('envía los argumentos sueltos que exige la API (sin objeto input)', async () => {
    const { createDropeaOrder } = await import('../actions')
    await createDropeaOrder({
      items: [cartItem],
      customer,
      locale: 'es',
      reference: 'ORDER-ABC123',
      paymentMethod: 'PAID',
    })

    expect(mockDropeaRequest).toHaveBeenCalledTimes(1)
    const variables = mockDropeaRequest.mock.calls[0]?.[1]
    expect(variables).toMatchObject({
      shop_id: 17593,
      payment_method: 'PAID',
      external_order_name: 'ORDER-ABC123',
    })
    expect(variables).not.toHaveProperty('input')
  })

  it('mapea customer al CustomerInputType (first/last name, phone, zip)', async () => {
    const { createDropeaOrder } = await import('../actions')
    await createDropeaOrder({
      items: [cartItem],
      customer,
      locale: 'es',
      reference: 'ORDER-ABC123',
      paymentMethod: 'PAID',
    })

    const variables = mockDropeaRequest.mock.calls[0]?.[1]
    expect(variables.customer).toEqual({
      first_name: 'Juan',
      last_name: 'Pérez García',
      email: 'juan@example.com',
      phone: '+34600000000',
      address: 'Calle Falsa 123',
      city: 'Madrid',
      zip: '28001',
      country: 'ES',
    })
  })

  it('respeta apellidos compuestos sin adivinar ni partir strings', async () => {
    const { createDropeaOrder } = await import('../actions')
    await createDropeaOrder({
      items: [cartItem],
      customer: { ...customer, firstName: 'María José', lastName: 'García López' },
      locale: 'es',
      reference: 'ORDER-ABC123',
      paymentMethod: 'PAID',
    })

    const variables = mockDropeaRequest.mock.calls[0]?.[1]
    expect(variables.customer.first_name).toBe('María José')
    expect(variables.customer.last_name).toBe('García López')
  })

  it('mapea items al OrderProductInputType con unit_price y total_value en euros', async () => {
    const { createDropeaOrder } = await import('../actions')
    await createDropeaOrder({
      items: [cartItem],
      customer,
      locale: 'es',
      reference: 'ORDER-ABC123',
      paymentMethod: 'PAID',
    })

    const variables = mockDropeaRequest.mock.calls[0]?.[1]
    expect(variables.products).toEqual([
      { product_id: 5227, unit_price: 29.99, quantity: 2, total_value: 59.98 },
    ])
  })

  it('retorna el id de la orden creada', async () => {
    const { createDropeaOrder } = await import('../actions')
    const result = await createDropeaOrder({
      items: [cartItem],
      customer,
      locale: 'es',
      reference: 'ORDER-ABC123',
      paymentMethod: 'PAID',
    })
    expect(result.orderId).toBe('9001')
  })
})

describe('createCodOrder', () => {
  beforeEach(() => {
    vi.stubEnv('DROPEA_SHOP_ID', '17593')
    mockDropeaRequest.mockReset()
    mockDropeaRequest.mockResolvedValue({
      orderCreate: { id: '9002', status: 'PENDING', total_amount: 59.98 },
    })
    __setDropeaClient(mockDropeaClient)
  })

  it('crea la orden con CASH_ON_DELIVERY y retorna orderId + reference', async () => {
    const { createCodOrder } = await import('../actions')
    const result = await createCodOrder({
      items: [cartItem],
      customer,
      locale: 'es',
    })

    const variables = mockDropeaRequest.mock.calls[0]?.[1]
    expect(variables.payment_method).toBe('CASH_ON_DELIVERY')
    expect(result.orderId).toBe('9002')
    expect(result.reference).toMatch(/^ORDER-/)
    expect(variables.external_order_name).toBe(result.reference)
  })
})
