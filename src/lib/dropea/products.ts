// src/lib/dropea/products.ts
// Service layer — queries de productos contra Dropea
// Úsalo solo desde Server Components / Server Actions (server-only)

import { getDropeaClient } from './client'
import { LIST_PRODUCTS_QUERY, GET_PRODUCT_BY_ID_QUERY } from './queries/products'
import { mapDropeaProduct } from './mappers'
import type { Product, ProductPage, DropeaRawProductPagination } from './types'

export async function listProducts(
  page = 1,
  limit = 40,
  sort?: string,
  category?: string,
): Promise<ProductPage> {
  const client = getDropeaClient()
  const variables: Record<string, unknown> = { page, limit }
  if (sort) variables.sort = sort
  if (category) variables.categories = [category]

  let data: { products: DropeaRawProductPagination }

  try {
    data = await client.request<{ products: DropeaRawProductPagination }>(
      LIST_PRODUCTS_QUERY,
      variables,
    )
  } catch {
    // Si la API no soporta filtro por categories, caemos a traer todo y filtrar
    if (category) {
      const allData = await client.request<{ products: DropeaRawProductPagination }>(
        LIST_PRODUCTS_QUERY,
        { page: 1, limit: 100, sort },
      )
      const allMapped = allData.products.data.map(mapDropeaProduct).filter(p => p.isPublic)
      const filtered = allMapped.filter(
        p => p.category.toLowerCase() === category.toLowerCase(),
      )
      const totalFiltered = filtered.length
      const lastPage = Math.ceil(totalFiltered / limit)
      const start = (page - 1) * limit
      return {
        items: filtered.slice(start, start + limit),
        total: totalFiltered,
        currentPage: page,
        lastPage,
        perPage: limit,
      }
    }
    throw new Error('Failed to fetch products from Dropea')
  }

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
