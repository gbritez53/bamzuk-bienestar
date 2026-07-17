// src/lib/email/resend.ts
// Cliente de Resend — SIEMPRE server-side, nunca NEXT_PUBLIC_

import { Resend } from 'resend'

function createResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }
  return new Resend(apiKey)
}

// Singleton — mismo patrón que getDropeaClient()
let _client: Resend | null = null

export function getResendClient(): Resend {
  if (!_client) {
    _client = createResendClient()
  }
  return _client
}

/**
 * Para testing únicamente — permite inyectar un cliente mock o resetear el singleton.
 */
export function __setResendClient(client: Resend | null): void {
  _client = client
}
