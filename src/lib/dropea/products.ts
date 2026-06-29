// src/lib/dropea/products.ts
// Service layer — queries de productos contra Dropea
// Úsalo solo desde Server Components / Server Actions (server-only)

import { getDropeaClient } from './client'
import { LIST_PRODUCTS_QUERY, GET_PRODUCT_BY_ID_QUERY } from './queries/products'
import { mapDropeaProduct } from './mappers'
import type { Product, ProductPage, DropeaRawProductPagination } from './types'

export async function listProducts(
  page = 1,
  limit = 20,
  sort?: string,
): Promise<ProductPage> {
  const client = getDropeaClient()
  const data = await client.request<{ products: DropeaRawProductPagination }>(
    LIST_PRODUCTS_QUERY,
    { page, limit, sort },
  )
  const all = data.products.data.map(mapDropeaProduct)
  return {
    items: all.filter(p => p.isPublic),
    total: data.products.total,
    currentPage: data.products.current_page,
    lastPage: data.products.last_page,
    perPage: data.products.per_page,
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  const client = getDropeaClient()
  const data = await client.request<{ products: { data: DropeaRawProductPagination['data'] } }>(
    GET_PRODUCT_BY_ID_QUERY,
    { id: [id] },
  )
  const raw = data.products.data[0]
  return raw ? mapDropeaProduct(raw) : null
}
