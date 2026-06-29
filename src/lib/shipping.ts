export type ShippingService = 'servicio_24' | 'servicio_19' | 'servicio_14'

export interface ShippingRate {
  service: ShippingService
  costEur: number
  label: string // "Entrega en 24h", "Entrega en 19h", "Entrega en 14h"
}

interface TramoConfig {
  from: number
  to: number
  price: number
}

interface ServiceConfig {
  label: string
  tramos: readonly TramoConfig[]
  extraPerKg: number
  baseOver10: number
}

// Tabla de tarifas — EXACTAS del panel de Dropea (no modificar sin verificar)
const RATES: Record<ShippingService, ServiceConfig> = {
  servicio_24: {
    label: 'Entrega en 24h',
    tramos: [
      { from: 0, to: 1, price: 3.68 },
      { from: 1, to: 2, price: 3.94 },
      { from: 2, to: 3, price: 4.20 },
      { from: 3, to: 5, price: 4.73 },
      { from: 5, to: 10, price: 6.20 },
    ],
    extraPerKg: 0.37,
    baseOver10: 6.20,
  },
  servicio_19: {
    label: 'Entrega en 19h',
    tramos: [
      { from: 0, to: 3, price: 4.20 },
      { from: 3, to: 5, price: 4.46 },
      { from: 5, to: 10, price: 4.73 },
    ],
    extraPerKg: 0.42,
    baseOver10: 4.73,
  },
  servicio_14: {
    label: 'Entrega en 14h',
    tramos: [
      { from: 0, to: 1, price: 4.73 },
      { from: 1, to: 2, price: 4.99 },
      { from: 2, to: 3, price: 5.25 },
      { from: 3, to: 5, price: 5.51 },
      { from: 5, to: 10, price: 5.78 },
    ],
    extraPerKg: 0.53,
    baseOver10: 5.78,
  },
}

export const DEFAULT_SHIPPING_SERVICE: ShippingService = 'servicio_24'

// Tarifa plana cuando el producto no tiene peso registrado
export const FALLBACK_RATE_EUR = 3.68

/**
 * Calcula el costo de envío según el peso total del carrito.
 * @param weightKg - peso total en kg. Si es 0, negativo o null → fallback €3.68
 * @param service  - servicio de envío (default: servicio_24)
 *
 * Rangos: el límite inferior es inclusivo, el superior es exclusivo (e.g. tramo 0–1kg
 * cubre [0, 1)). El límite de 10kg pertenece al último tramo, no al cálculo de exceso.
 */
export function calcularEnvio(
  weightKg: number | null,
  service: ShippingService = DEFAULT_SHIPPING_SERVICE,
): ShippingRate {
  const config = RATES[service]

  // Fallback cuando no hay peso válido
  if (!weightKg || weightKg <= 0) {
    return {
      service,
      costEur: FALLBACK_RATE_EUR,
      label: config.label,
    }
  }

  // Más de 10 kg: cargo base del último tramo + extra por kg adicional
  if (weightKg > 10) {
    const extraKg = weightKg - 10
    const cost = Math.round((config.baseOver10 + extraKg * config.extraPerKg) * 100) / 100
    return { service, costEur: cost, label: config.label }
  }

  // Buscar tramo: límite inferior inclusivo (>=), límite superior exclusivo (<).
  // Fallback al último tramo para cubrir exactamente 10 kg (10 >= 5 && 10 < 10 falla).
  const tramos = config.tramos
  const tramo =
    tramos.find(t => weightKg >= t.from && weightKg < t.to) ??
    tramos[tramos.length - 1]!

  return { service, costEur: tramo.price, label: config.label }
}

/**
 * Calcula el peso total real de un carrito.
 * @param items - array de items con weightKg y quantity
 */
export function calcularPesoTotal(
  items: Array<{ weightKg: number; quantity: number }>,
): number {
  return items.reduce((acc, item) => acc + item.weightKg * item.quantity, 0)
}

interface ItemWithDimensions {
  weightKg: number | null
  dimensions: { lengthCm: number; widthCm: number; heightCm: number } | null
  quantity: number
}

/**
 * Calcula el peso volumétrico de un item individual.
 * Fórmula Dropea: (Largo × Ancho × Alto) / 6000
 * El resultado está en kg. Usa dimensiones en cm.
 */
export function calcularPesoVolumetrico(
  dimensions: { lengthCm: number; widthCm: number; heightCm: number },
): number {
  return (dimensions.lengthCm * dimensions.widthCm * dimensions.heightCm) / 6000
}

/**
 * Calcula el peso efectivo para envío: el MAYOR entre peso real y peso volumétrico.
 * Si ningún item tiene dimensiones, cae a peso real.
 * Si ningún item tiene peso real, devuelve null (fallback a tarifa plana).
 *
 * @returns peso efectivo en kg, o null si no hay datos suficientes
 */
export function calcularPesoEfectivo(items: ItemWithDimensions[]): number | null {
  let totalReal = 0
  let totalVolumetrico = 0
  let hasWeight = false
  let hasDimensions = false

  for (const item of items) {
    if (item.weightKg != null) {
      totalReal += item.weightKg * item.quantity
      hasWeight = true
    }
    if (item.dimensions) {
      const vol = calcularPesoVolumetrico(item.dimensions) * item.quantity
      totalVolumetrico += vol
      hasDimensions = true
    }
  }

  if (!hasWeight) return null

  if (!hasDimensions) return totalReal

  return Math.max(totalReal, totalVolumetrico)
}

/**
 * Calcula si corresponde envío gratis según el subtotal del carrito.
 * Configurable via env var NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD.
 * Si el threshold es 0 o no está seteado → nunca gratis.
 */
export function esEnvioGratis(subtotalEur: number): boolean {
  const raw = process.env['NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD']
  const threshold = Number(raw ?? 0)
  if (threshold <= 0) return false
  return subtotalEur >= threshold
}
