// src/lib/dropea/products.ts
// Service layer — queries de productos contra Dropea
// Úsalo solo desde Server Components / Server Actions (server-only)
// El filtrado por categoría se hace EN MEMORIA porque Dropea no lo soporta en API

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

  if (category) {
    // Filtrado en memoria: traemos más productos y filtramos por categoría
    // Nota: con 4028 productos totales, traemos hasta 100 para mantener performance
    const fetchLimit = Math.max(limit, 100)
    const data = await client.request<{ products: DropeaRawProductPagination }>(
      LIST_PRODUCTS_QUERY,
      { page: 1, limit: fetchLimit, ...(sort ? { sort } : {}) },
    )

    const allMapped = data.products.data.map(mapDropeaProduct).filter(p => p.isPublic)
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

  // Sin filtro de categoría — consulta normal
  const data = await client.request<{ products: DropeaRawProductPagination }>(
    LIST_PRODUCTS_QUERY,
    variables,
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
