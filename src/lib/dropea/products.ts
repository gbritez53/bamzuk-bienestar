// src/lib/dropea/products.ts
// Service layer — queries de productos contra Dropea
// Úsalo solo desde Server Components / Server Actions (server-only)
// El filtrado por categoría se hace EN MEMORIA porque Dropea no lo soporta en API

import { getDropeaClient } from './client'
import { LIST_PRODUCTS_QUERY, GET_PRODUCT_BY_ID_QUERY } from './queries/products'
import { mapDropeaProduct } from './mappers'
import type { Product, ProductPage, DropeaRawProductPagination } from './types'

const MAX_FETCH_PER_PAGE = 250

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
    // Filtrar por categoría en memoria: recorremos páginas hasta encontrar suficientes
    const allProducts: Product[] = []
    let currentPage = 1
    let lastPage = 1

    while (currentPage <= lastPage) {
      const data = await client.request<{ products: DropeaRawProductPagination }>(
        LIST_PRODUCTS_QUERY,
        { page: currentPage, limit: MAX_FETCH_PER_PAGE, ...(sort ? { sort } : {}) },
      )

      const mapped = data.products.data.map(mapDropeaProduct).filter(p => p.isPublic)
      const filtered = mapped.filter(
        p => p.category.toLowerCase() === category.toLowerCase(),
      )
      allProducts.push(...filtered)

      lastPage = data.products.last_page
      currentPage++

      // Safety: no recorrer más de 20 páginas (5000 productos)
      if (currentPage > 20) break
    }

    // Aplicar paginación sobre el resultado filtrado
    const totalFiltered = allProducts.length
    const totalLastPage = Math.ceil(totalFiltered / limit)
    const start = (page - 1) * limit

    return {
      items: allProducts.slice(start, start + limit),
      total: totalFiltered,
      currentPage: page,
      lastPage: totalLastPage,
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
