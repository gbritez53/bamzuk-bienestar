import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calcularEnvio,
  calcularPesoTotal,
  calcularPesoVolumetrico,
  calcularPesoEfectivo,
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
// calcularPesoVolumetrico
// ────────────────────────────────────────────────────────────────────────────────

describe('calcularPesoVolumetrico', () => {
  it('30cm × 20cm × 15cm → 1.5 kg (9000/6000)', () => {
    expect(calcularPesoVolumetrico({ lengthCm: 30, widthCm: 20, heightCm: 15 })).toBe(1.5)
  })

  it('60cm × 40cm × 30cm → 12 kg (72000/6000)', () => {
    expect(calcularPesoVolumetrico({ lengthCm: 60, widthCm: 40, heightCm: 30 })).toBe(12)
  })

  it('caja pequeña 10×10×10 → 0.167 kg (1000/6000)', () => {
    const result = calcularPesoVolumetrico({ lengthCm: 10, widthCm: 10, heightCm: 10 })
    expect(result).toBeCloseTo(0.167, 3)
  })
})

// ────────────────────────────────────────────────────────────────────────────────
// calcularPesoEfectivo
// ────────────────────────────────────────────────────────────────────────────────

describe('calcularPesoEfectivo', () => {
  it('usa peso real cuando no hay dimensiones', () => {
    const items = [
      { weightKg: 2, dimensions: null, quantity: 1 },
      { weightKg: 3, dimensions: null, quantity: 2 },
    ]
    expect(calcularPesoEfectivo(items)).toBe(8) // 2 + 3*2
  })

  it('usa peso volumétrico cuando es mayor que real', () => {
    // Item liviano pero grande: 1kg real, caja 60×40×30cm = 12kg vol
    const items = [
      { weightKg: 1, dimensions: { lengthCm: 60, widthCm: 40, heightCm: 30 }, quantity: 1 },
    ]
    expect(calcularPesoEfectivo(items)).toBe(12) // max(1, 12)
  })

  it('usa peso real cuando es mayor que volumétrico', () => {
    // Item pesado pero compacto: 50kg real, caja 10×10×10 = 0.167 vol
    const items = [
      { weightKg: 50, dimensions: { lengthCm: 10, widthCm: 10, heightCm: 10 }, quantity: 1 },
    ]
    expect(calcularPesoEfectivo(items)).toBe(50) // max(50, 0.167)
  })

  it('multiplica por quantity correctamente', () => {
    // 2 items de 1kg real cada uno, caja 30×20×15 = 1.5kg vol cada uno
    const items = [
      { weightKg: 1, dimensions: { lengthCm: 30, widthCm: 20, heightCm: 15 }, quantity: 3 },
    ]
    // Real: 1*3 = 3, Vol: 1.5*3 = 4.5
    expect(calcularPesoEfectivo(items)).toBe(4.5)
  })

  it('mezcla items con y sin dimensiones', () => {
    const items = [
      { weightKg: 2, dimensions: null, quantity: 1 },                                        // real: 2
      { weightKg: 1, dimensions: { lengthCm: 60, widthCm: 40, heightCm: 30 }, quantity: 2 }, // real: 2, vol: 24
    ]
    // Real total: 2 + 2 = 4, Vol total: 0 + 24 = 24
    expect(calcularPesoEfectivo(items)).toBe(24)
  })

  it('devuelve null si ningún item tiene peso', () => {
    const items = [
      { weightKg: null, dimensions: null, quantity: 1 },
    ]
    expect(calcularPesoEfectivo(items)).toBeNull()
  })

  it('usa peso real si hay dimensiones pero no weightKg', () => {
    // Si no hay peso real pero hay dimensiones, las dimensiones no cuentan sin peso real
    const items = [
      { weightKg: null, dimensions: { lengthCm: 60, widthCm: 40, heightCm: 30 }, quantity: 1 },
    ]
    expect(calcularPesoEfectivo(items)).toBeNull()
  })

  it('array vacío → null', () => {
    expect(calcularPesoEfectivo([])).toBeNull()
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
