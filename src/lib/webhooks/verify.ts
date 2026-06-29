import { createHmac, timingSafeEqual } from 'crypto'

function verifyHmac(payload: string, signature: string, secret: string): boolean {
  if (!signature.startsWith('sha256=')) return false
  const expected = 'sha256=' + createHmac('sha256', secret).update(payload).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export const verifyDropeaSignature = verifyHmac
export const verifySumUpSignature = verifyHmac
