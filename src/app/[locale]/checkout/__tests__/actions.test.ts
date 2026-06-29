import { describe, it, expect, vi, beforeEach } from 'vitest'

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
