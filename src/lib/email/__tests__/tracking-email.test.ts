import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Resend } from 'resend'
import { __setResendClient } from '@/lib/email/resend'

const mockSend = vi.fn()
const mockClient = { emails: { send: mockSend } } as unknown as Resend

beforeEach(() => {
  mockSend.mockReset()
  mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null })
  __setResendClient(mockClient)
  vi.stubEnv('RESEND_FROM_EMAIL', 'pedidos@test.com')
})

const baseInput = {
  to: 'cliente@test.com',
  customerName: 'Daniel Longone',
  orderId: '1295211',
  trackingCode: '0280010280017024587071',
  trackingUrl: 'https://dinapaqweb.tipsa-dinapaq.com/dinapaqweb/detalle_envio.php?servicio=xxx',
  carrierCompany: '#1 - tipsa',
  locale: 'es' as const,
}

describe('inferLocaleFromZip', () => {
  it('código postal español (5 dígitos, sin guión) → es', async () => {
    const { inferLocaleFromZip } = await import('@/lib/email/tracking-email')
    expect(inferLocaleFromZip('28001')).toBe('es')
  })

  it('código postal portugués (con guión) → pt', async () => {
    const { inferLocaleFromZip } = await import('@/lib/email/tracking-email')
    expect(inferLocaleFromZip('1000-001')).toBe('pt')
  })

  it('sin código postal → es (default)', async () => {
    const { inferLocaleFromZip } = await import('@/lib/email/tracking-email')
    expect(inferLocaleFromZip(null)).toBe('es')
  })
})

describe('sendTrackingEmail', () => {
  it('manda el mail con destinatario y asunto correctos', async () => {
    const { sendTrackingEmail } = await import('@/lib/email/tracking-email')
    await sendTrackingEmail(baseInput)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'pedidos@test.com',
        to: 'cliente@test.com',
        subject: expect.stringContaining('camino'),
      }),
    )
  })

  it('el HTML incluye el código y el link de tracking', async () => {
    const { sendTrackingEmail } = await import('@/lib/email/tracking-email')
    await sendTrackingEmail(baseInput)
    const call = mockSend.mock.calls[0]?.[0]
    expect(call.html).toContain(baseInput.trackingCode)
    expect(call.html).toContain(baseInput.trackingUrl)
  })

  it('locale pt usa el asunto en portugués', async () => {
    const { sendTrackingEmail } = await import('@/lib/email/tracking-email')
    await sendTrackingEmail({ ...baseInput, locale: 'pt' })
    const call = mockSend.mock.calls[0]?.[0]
    expect(call.subject).toContain('caminho')
  })

  it('lanza error si RESEND_FROM_EMAIL no está seteado', async () => {
    vi.stubEnv('RESEND_FROM_EMAIL', '')
    const { sendTrackingEmail } = await import('@/lib/email/tracking-email')
    await expect(sendTrackingEmail(baseInput)).rejects.toThrow('RESEND_FROM_EMAIL')
  })

  it('lanza error si Resend devuelve error', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Invalid from address' } })
    const { sendTrackingEmail } = await import('@/lib/email/tracking-email')
    await expect(sendTrackingEmail(baseInput)).rejects.toThrow('Invalid from address')
  })
})
