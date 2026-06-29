import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GraphQLClient } from 'graphql-request'
import { __setDropeaClient } from '@/lib/dropea/client'

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

beforeEach(() => {
  mockRequest.mockReset()
  __setDropeaClient(mockClient)
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

  it('pasa categories cuando se filtra por categoría', async () => {
    mockRequest.mockResolvedValue({
      products: {
        data: [],
        total: 0,
        current_page: 1,
        last_page: 1,
        per_page: 40,
      },
    })
    const { listProducts } = await import('@/lib/dropea/products')
    await listProducts(1, 40, undefined, 'Electrónica')
    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      page: 1,
      limit: 40,
      categories: ['Electrónica'],
    })
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
