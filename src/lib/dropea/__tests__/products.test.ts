import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GraphQLClient } from 'graphql-request'
import { __setDropeaClient } from '@/lib/dropea/client'
import { categoryMatches } from '@/lib/dropea/products'

// Usamos un mock object en vez de mockear el constructor — más simple y robusto
const mockRequest = vi.fn()
const mockClient = { request: mockRequest } as unknown as GraphQLClient

const rawProduct = {
  id: '60',
  name: 'Test',
  sku: 'SKU-1',
  description: 'Desc',
  state: 'PUBLIC',
  weight: 1.5,
  height: 10,
  width: 10,
  length: 20,
  pvpr: 29.99,
  cost_price: 15.0,
  images: ['https://api.dropea.com/img/product-file'],
  category: 'Hogar',
  variants: [],
}

beforeEach(async () => {
  mockRequest.mockReset()
  __setDropeaClient(mockClient)
  const { __resetCatalogCache } = await import('@/lib/dropea/products')
  __resetCatalogCache()
})

describe('listProducts', () => {
  it('retorna ProductPage con items mapeados', async () => {
    mockRequest.mockResolvedValue({
      products: {
        data: [rawProduct],
        total: 1,
        current_page: 1,
        last_page: 1,
        per_page: 20,
      },
    })
    const { listProducts } = await import('@/lib/dropea/products')
    const result = await listProducts()
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.name).toBe('Test')
    expect(result.total).toBe(1)
  })

  it('filtra productos no PUBLIC', async () => {
    mockRequest.mockResolvedValue({
      products: {
        data: [rawProduct, { ...rawProduct, id: '61', state: 'PRIVATE' }],
        total: 2,
        current_page: 1,
        last_page: 1,
        per_page: 20,
      },
    })
    const { listProducts } = await import('@/lib/dropea/products')
    const result = await listProducts()
    expect(result.items).toHaveLength(1)
  })

  it('acepta page, limit y category', async () => {
    mockRequest.mockResolvedValue({
      products: {
        data: [],
        total: 0,
        current_page: 2,
        last_page: 5,
        per_page: 10,
      },
    })
    const { listProducts } = await import('@/lib/dropea/products')
    await listProducts(2, 10)
    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      page: 2,
      limit: 10,
    })
  })

  it('filtra por categoría en memoria cuando se pasa category', async () => {
    const electrónica = { ...rawProduct, id: '1', category: 'Electrónica', state: 'PUBLIC' }
    const hogar = { ...rawProduct, id: '2', category: 'Hogar', state: 'PUBLIC' }
    mockRequest.mockResolvedValue({
      products: {
        data: [electrónica, hogar],
        total: 2,
        current_page: 1,
        last_page: 1,
        per_page: 100,
      },
    })
    const { listProducts } = await import('@/lib/dropea/products')
    const result = await listProducts(1, 40, undefined, 'Electrónica')
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.id).toBe('1')
    expect(result.total).toBe(1)
  })

  it('excluye productos con pvpr 0 (sin precio de venta cargado)', async () => {
    // el pvpr crudo se ignora y se recalcula desde cost_price — para dejar
    // el pvpr resultante en 0 hace falta cost_price 0 (costo real
    // incalculable), no alcanza con setear pvpr: 0
    mockRequest.mockResolvedValue({
      products: {
        data: [rawProduct, { ...rawProduct, id: '62', pvpr: 0, cost_price: 0 }],
        total: 2,
        current_page: 1,
        last_page: 1,
        per_page: 20,
      },
    })
    const { listProducts } = await import('@/lib/dropea/products')
    const result = await listProducts()
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.id).toBe('60')
  })

  it('excluye productos con pvpr 0 también al filtrar por categoría', async () => {
    mockRequest.mockResolvedValue({
      products: {
        data: [
          { ...rawProduct, id: '1', category: 'Mascotas' },
          { ...rawProduct, id: '2', category: 'Mascotas', pvpr: 0, cost_price: 0 },
        ],
        total: 2,
        current_page: 1,
        last_page: 1,
        per_page: 50,
      },
    })
    const { listProducts } = await import('@/lib/dropea/products')
    const result = await listProducts(1, 40, undefined, 'Mascotas')
    expect(result.items).toHaveLength(1)
    expect(result.total).toBe(1)
  })

  it('recorre TODAS las páginas que reporta last_page al filtrar por categoría', async () => {
    // Dropea capea per_page a 50 aunque se pida más — el scan debe
    // confiar en last_page, no en el limit solicitado
    mockRequest.mockImplementation((_query: unknown, vars: { page: number }) =>
      Promise.resolve({
        products: {
          data: [{ ...rawProduct, id: String(vars.page), category: 'Mascotas' }],
          total: 3,
          current_page: vars.page,
          last_page: 3,
          per_page: 50,
        },
      }),
    )
    const { listProducts } = await import('@/lib/dropea/products')
    const result = await listProducts(1, 40, undefined, 'Mascotas')
    expect(mockRequest).toHaveBeenCalledTimes(3)
    expect(result.total).toBe(3)
    expect(result.items.map(p => p.id).sort()).toEqual(['1', '2', '3'])
  })

  it('cachea el escaneo de catálogo entre llamadas (no re-fetchea dentro del TTL)', async () => {
    mockRequest.mockResolvedValue({
      products: {
        data: [{ ...rawProduct, id: '1', category: 'Mascotas' }],
        total: 1,
        current_page: 1,
        last_page: 1,
        per_page: 50,
      },
    })
    const { listProducts } = await import('@/lib/dropea/products')
    await listProducts(1, 40, undefined, 'Mascotas')
    await listProducts(2, 40, undefined, 'Mascotas')
    expect(mockRequest).toHaveBeenCalledTimes(1)
  })

  it('filtra por múltiples categorías separadas por coma (Dropea no expone una categoría combinada)', async () => {
    // Descubierto verificando la API viva 2026-07-06: "Salud y cuidado
    // personal, belleza" NO existe como categoría única — son 2 categorías
    // reales separadas por coma en NICHO_CATEGORY.
    const belleza = { ...rawProduct, id: '1', category: 'Belleza', state: 'PUBLIC' }
    const salud = { ...rawProduct, id: '2', category: 'Salud y cuidado personal', state: 'PUBLIC' }
    const hogar = { ...rawProduct, id: '3', category: 'Hogar', state: 'PUBLIC' }
    mockRequest.mockResolvedValue({
      products: {
        data: [belleza, salud, hogar],
        total: 3,
        current_page: 1,
        last_page: 1,
        per_page: 100,
      },
    })
    const { listProducts } = await import('@/lib/dropea/products')
    const result = await listProducts(1, 40, undefined, 'Salud y cuidado personal,Belleza')
    expect(result.items.map(p => p.id).sort()).toEqual(['1', '2'])
    expect(result.total).toBe(2)
  })
})

describe('categoryMatches', () => {
  it('devuelve true si no hay categoría configurada (sin filtro)', () => {
    expect(categoryMatches('Cualquiera', '')).toBe(true)
  })

  it('coincide exacta case-insensitive con una única categoría configurada', () => {
    expect(categoryMatches('belleza', 'Belleza')).toBe(true)
    expect(categoryMatches('Hogar', 'Belleza')).toBe(false)
  })

  it('coincide con cualquiera de varias categorías separadas por coma', () => {
    expect(categoryMatches('Belleza', 'Salud y cuidado personal,Belleza')).toBe(true)
    expect(categoryMatches('Salud y cuidado personal', 'Salud y cuidado personal,Belleza')).toBe(true)
    expect(categoryMatches('Hogar', 'Salud y cuidado personal,Belleza')).toBe(false)
  })

  it('ignora espacios extra alrededor de cada categoría en la lista', () => {
    expect(categoryMatches('Belleza', 'Salud y cuidado personal , Belleza ')).toBe(true)
  })
})

describe('getProductById', () => {
  it('retorna Product mapeado cuando existe', async () => {
    mockRequest.mockResolvedValue({ products: { data: [rawProduct] } })
    const { getProductById } = await import('@/lib/dropea/products')
    const product = await getProductById(60)
    expect(product).not.toBeNull()
    expect(product?.id).toBe('60')
  })

  it('retorna null cuando no existe', async () => {
    mockRequest.mockResolvedValue({ products: { data: [] } })
    const { getProductById } = await import('@/lib/dropea/products')
    const product = await getProductById(999)
    expect(product).toBeNull()
  })
})
