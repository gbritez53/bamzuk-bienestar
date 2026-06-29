import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calcularEnvio,
  calcularPesoTotal,
  esEnvioGratis,
  FALLBACK_RATE_EUR,
  DEFAULT_SHIPPING_SERVICE,
  type ShippingService,
} from '../shipping'

// ────────────────────────────────────────────────────────────────────────────────
// calcularEnvio — Servicio 24 (default)
// ────────────────────────────────────────────────────────────────────────────────

describe('calcularEnvio — Servicio 24', () => {
  it('0.5 kg → €3.68 (tramo 1)', () => {
    const result = calcularEnvio(0.5, 'servicio_24')
    expect(result.costEur).toBe(3.68)
    expect(result.service).toBe('servicio_24')
    expect(result.label).toBe('Entrega en 24h')
  })

  it('exactamente 1 kg → €3.94 (límite superior exclusivo del tramo anterior)', () => {
    const result = calcularEnvio(1, 'servicio_24')
    expect(result.costEur).toBe(3.94)
  })

  it('1.5 kg → €3.94 (tramo 2)', () => {
    const result = calcularEnvio(1.5, 'servicio_24')
    expect(result.costEur).toBe(3.94)
  })

  it('2.5 kg → €4.20 (tramo 3)', () => {
    const result = calcularEnvio(2.5, 'servicio_24')
    expect(result.costEur).toBe(4.20)
  })

  it('4 kg → €4.73 (tramo 4)', () => {
    const result = calcularEnvio(4, 'servicio_24')
    expect(result.costEur).toBe(4.73)
  })

  it('7 kg → €6.20 (tramo 5)', () => {
    const result = calcularEnvio(7, 'servicio_24')
    expect(result.costEur).toBe(6.20)
  })

  it('12 kg → €6.94 (base 6.20 + 2 × €0.37)', () => {
    const result = calcularEnvio(12, 'servicio_24')
    expect(result.costEur).toBe(6.94)
  })
})

// ────────────────────────────────────────────────────────────────────────────────
// calcularEnvio — Servicio 19
// ────────────────────────────────────────────────────────────────────────────────

describe('calcularEnvio — Servicio 19', () => {
  it('1 kg → €4.20 (plano hasta 3kg)', () => {
    const result = calcularEnvio(1, 'servicio_19')
    expect(result.costEur).toBe(4.20)
    expect(result.label).toBe('Entrega en 19h')
  })

  it('2.5 kg → €4.20 (plano hasta 3kg)', () => {
    const result = calcularEnvio(2.5, 'servicio_19')
    expect(result.costEur).toBe(4.20)
  })

  it('4 kg → €4.46 (tramo 2)', () => {
    const result = calcularEnvio(4, 'servicio_19')
    expect(result.costEur).toBe(4.46)
  })

  it('8 kg → €4.73 (tramo 3)', () => {
    const result = calcularEnvio(8, 'servicio_19')
    expect(result.costEur).toBe(4.73)
  })

  it('11 kg → €5.15 (base 4.73 + 1 × €0.42)', () => {
    const result = calcularEnvio(11, 'servicio_19')
    expect(result.costEur).toBe(5.15)
  })
})

// ────────────────────────────────────────────────────────────────────────────────
// calcularEnvio — Servicio 14
// ────────────────────────────────────────────────────────────────────────────────

describe('calcularEnvio — Servicio 14', () => {
  it('0.5 kg → €4.73 (tramo 1)', () => {
    const result = calcularEnvio(0.5, 'servicio_14')
    expect(result.costEur).toBe(4.73)
    expect(result.label).toBe('Entrega en 14h')
  })

  it('1.5 kg → €4.99 (tramo 2)', () => {
    const result = calcularEnvio(1.5, 'servicio_14')
    expect(result.costEur).toBe(4.99)
  })

  it('11 kg → €6.31 (base 5.78 + 1 × €0.53)', () => {
    const result = calcularEnvio(11, 'servicio_14')
    expect(result.costEur).toBe(6.31)
  })
})

// ────────────────────────────────────────────────────────────────────────────────
// calcularEnvio — casos edge
// ────────────────────────────────────────────────────────────────────────────────

describe('calcularEnvio — casos edge', () => {
  it('weightKg null → fallback FALLBACK_RATE_EUR con servicio_24', () => {
    const result = calcularEnvio(null, 'servicio_24')
    expect(result.costEur).toBe(FALLBACK_RATE_EUR)
    expect(result.service).toBe('servicio_24')
  })

  it('weightKg 0 → fallback FALLBACK_RATE_EUR', () => {
    const result = calcularEnvio(0, 'servicio_24')
    expect(result.costEur).toBe(FALLBACK_RATE_EUR)
  })

  it('weightKg negativo → fallback FALLBACK_RATE_EUR', () => {
    const result = calcularEnvio(-1, 'servicio_24')
    expect(result.costEur).toBe(FALLBACK_RATE_EUR)
  })

  it('sin service arg → usa servicio_24 por defecto', () => {
    const result = calcularEnvio(0.5)
    expect(result.service).toBe(DEFAULT_SHIPPING_SERVICE)
    expect(result.service).toBe('servicio_24')
    expect(result.costEur).toBe(3.68)
  })
})

// ────────────────────────────────────────────────────────────────────────────────
// calcularPesoTotal
// ────────────────────────────────────────────────────────────────────────────────

describe('calcularPesoTotal', () => {
  it('2 items × 1.5 kg → 3 kg', () => {
    const items = [
      { weightKg: 1.5, quantity: 1 },
      { weightKg: 1.5, quantity: 1 },
    ]
    expect(calcularPesoTotal(items)).toBe(3)
  })

  it('items con quantity > 1', () => {
    const items = [
      { weightKg: 0.5, quantity: 3 },
      { weightKg: 1.0, quantity: 2 },
    ]
    expect(calcularPesoTotal(items)).toBe(3.5)
  })

  it('array vacío → 0', () => {
    expect(calcularPesoTotal([])).toBe(0)
  })
})

// ────────────────────────────────────────────────────────────────────────────────
// esEnvioGratis
// ────────────────────────────────────────────────────────────────────────────────

describe('esEnvioGratis', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('threshold 0 → nunca gratis', () => {
    vi.stubEnv('NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD', '0')
    expect(esEnvioGratis(100)).toBe(false)
  })

  it('threshold no seteado → nunca gratis', () => {
    vi.stubEnv('NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD', '')
    expect(esEnvioGratis(100)).toBe(false)
  })

  it('threshold 50, subtotal 49.99 → false', () => {
    vi.stubEnv('NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD', '50')
    expect(esEnvioGratis(49.99)).toBe(false)
  })

  it('threshold 50, subtotal 50 → true', () => {
    vi.stubEnv('NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD', '50')
    expect(esEnvioGratis(50)).toBe(true)
  })

  it('threshold 50, subtotal 100 → true', () => {
    vi.stubEnv('NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD', '50')
    expect(esEnvioGratis(100)).toBe(true)
  })
})
