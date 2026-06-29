import { createHmac } from 'crypto'
import { describe, it, expect } from 'vitest'
import { verifyDropeaSignature, verifySumUpSignature } from '../verify'

function makeHmac(payload: string, secret: string): string {
  return 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex')
}

const SECRET = 'test-secret'
const PAYLOAD = '{"event":"order.status_changed"}'

describe('verifyDropeaSignature', () => {
  it('retorna true con firma válida', () => {
    const sig = makeHmac(PAYLOAD, SECRET)
    expect(verifyDropeaSignature(PAYLOAD, sig, SECRET)).toBe(true)
  })

  it('retorna false con firma inválida', () => {
    expect(verifyDropeaSignature(PAYLOAD, 'sha256=invalid', SECRET)).toBe(false)
  })

  it('retorna false si signature no tiene prefijo sha256=', () => {
    const hmac = createHmac('sha256', SECRET).update(PAYLOAD).digest('hex')
    expect(verifyDropeaSignature(PAYLOAD, hmac, SECRET)).toBe(false)
  })
})

describe('verifySumUpSignature', () => {
  it('retorna true con firma válida', () => {
    const sig = makeHmac(PAYLOAD, SECRET)
    expect(verifySumUpSignature(PAYLOAD, sig, SECRET)).toBe(true)
  })

  it('retorna false con firma inválida', () => {
    expect(verifySumUpSignature(PAYLOAD, 'sha256=bad', SECRET)).toBe(false)
  })
})
