import { describe, it, expect } from 'vitest'
import type { DropeaRawProduct, DropeaRawVariant } from '@/lib/dropea/types'
import { mapDropeaProduct, mapDropeaVariant } from '@/lib/dropea/mappers'

// Schema real confirmado via exploración — 2026-06-29
const baseRaw: DropeaRawProduct = {
  id: '60',
  name: 'Almohada Cervical Test',
  sku: 'V0103849',
  description: 'Descripción del producto',
  state: 'PUBLIC',
  weight: 1.24,
  height: 18,
  width: 18,
  length: 30,
  pvpr: 32.98,
  cost_price: 16.33,
  images: ['https://api.dropea.com/100972/product-file'],
  category: 'Hogar y cocina',
  variants: [],
}

describe('mapDropeaProduct — campos básicos', () => {
  it('mapea id, name, sku y category', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.id).toBe('60')
    expect(result.name).toBe('Almohada Cervical Test')
    expect(result.sku).toBe('V0103849')
    expect(result.category).toBe('Hogar y cocina')
  })

  it('mapea costPrice desde cost_price', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.costPrice).toBe(16.33)
  })

  it('mapea pvpr correctamente', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.pvpr).toBe(32.98)
  })

  it('mapea weightKg desde weight', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.weightKg).toBe(1.24)
  })

  it('mapea dimensions (height, width, length)', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.dimensions).toEqual({ height: 18, width: 18, length: 30 })
  })

  it('isPublic true cuando state es PUBLIC', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.isPublic).toBe(true)
  })

  it('isPublic false cuando state NO es PUBLIC', () => {
    const result = mapDropeaProduct({ ...baseRaw, state: 'PRIVATE' })
    expect(result.isPublic).toBe(false)
  })
})

describe('mapDropeaProduct — imágenes (String[])', () => {
  it('normaliza array de URLs a { url, alt }', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.images).toHaveLength(1)
    expect(result.images[0]).toEqual({
      url: 'https://api.dropea.com/100972/product-file',
      alt: '',
    })
  })

  it('retorna array vacío cuando images es []', () => {
    const result = mapDropeaProduct({ ...baseRaw, images: [] })
    expect(result.images).toEqual([])
  })

  it('mapea múltiples imágenes', () => {
    const raw = {
      ...baseRaw,
      images: [
        'https://api.dropea.com/img1/product-file',
        'https://api.dropea.com/img2/product-file',
      ],
    }
    const result = mapDropeaProduct(raw)
    expect(result.images).toHaveLength(2)
    expect(result.images[1]?.url).toBe('https://api.dropea.com/img2/product-file')
  })
})

describe('mapDropeaProduct — variantes', () => {
  it('retorna array vacío cuando no hay variantes', () => {
    const result = mapDropeaProduct({ ...baseRaw, variants: [] })
    expect(result.variants).toEqual([])
  })

  it('mapea variantes con id, name, sku', () => {
    const variants: DropeaRawVariant[] = [
      { id: 'v1', name: 'Talla S', sku: 'SKU-S', state: 'PUBLIC' },
      { id: 'v2', name: 'Talla L', sku: 'SKU-L', state: 'PRIVATE' },
    ]
    const result = mapDropeaProduct({ ...baseRaw, variants })
    expect(result.variants).toHaveLength(2)
    expect(result.variants[0]).toEqual({ id: 'v1', name: 'Talla S', sku: 'SKU-S' })
    expect(result.variants[1]).toEqual({ id: 'v2', name: 'Talla L', sku: 'SKU-L' })
  })
})

describe('mapDropeaVariant — campos', () => {
  it('mapea id, name y sku', () => {
    const raw: DropeaRawVariant = { id: 'v1', name: 'Color Rojo', sku: 'SKU-R', state: 'PUBLIC' }
    const result = mapDropeaVariant(raw)
    expect(result).toEqual({ id: 'v1', name: 'Color Rojo', sku: 'SKU-R' })
  })
})
