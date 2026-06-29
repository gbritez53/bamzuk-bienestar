// src/lib/dropea/products.ts
// Service layer — queries de productos contra Dropea
// Úsalo solo desde Server Components / Server Actions (server-only)
// El filtrado por categoría se hace EN MEMORIA porque Dropea no lo soporta en API

import { cache } from 'react'
import { getDropeaClient } from './client'
import { LIST_PRODUCTS_QUERY, GET_PRODUCT_BY_ID_QUERY } from './queries/products'
import { mapDropeaProduct } from './mappers'
import type { Product, ProductPage, DropeaRawProductPagination } from './types'

const MAX_FETCH_PER_PAGE = 250
const SAFETY_MAX_PAGES = 20

type PageResult = DropeaRawProductPagination

/**
 * Fetch de una página de Dropea. Extraída para poder llamarla en paralelo.
 */
async function fetchPage(page: number, limit: number, sort?: string): Promise<PageResult> {
  const client = getDropeaClient()
  const data = await client.request<{ products: DropeaRawProductPagination }>(
    LIST_PRODUCTS_QUERY,
    { page, limit, ...(sort ? { sort } : {}) },
  )
  return data.products
}

/**
 * Trae TODOS los productos de una categoría, fetcheando páginas en paralelo.
 * El resultado se cachea con React.cache() para deduplicar dentro del mismo render.
 */
const fetchAllByCategory = cache(async (category: string, sort?: string): Promise<Product[]> => {
  // 1. Fetch page 1 para saber el total
  const firstPage = await fetchPage(1, MAX_FETCH_PER_PAGE, sort)
  const allPages: PageResult[] = [firstPage]

  const totalPages = Math.min(firstPage.last_page, SAFETY_MAX_PAGES)

  // 2. Fetch resto de páginas EN PARALELO
  if (totalPages > 1) {
    const remainingPages = []
    for (let p = 2; p <= totalPages; p++) {
      remainingPages.push(fetchPage(p, MAX_FETCH_PER_PAGE, sort))
    }
    const results = await Promise.all(remainingPages)
    allPages.push(...results)
  }

  // 3. Mapear, filtrar PUBLIC y filtrar por categoría
  const allProducts: Product[] = []
  for (const page of allPages) {
    const mapped = page.data.map(mapDropeaProduct).filter(p => p.isPublic)
    const filtered = mapped.filter(
      p => p.category.toLowerCase() === category.toLowerCase(),
    )
    allProducts.push(...filtered)
  }

  return allProducts
})

export async function listProducts(
  page = 1,
  limit = 40,
  sort?: string,
  category?: string,
): Promise<ProductPage> {
  const variables: Record<string, unknown> = { page, limit }
  if (sort) variables.sort = sort

  if (category) {
    // Dispara todas las páginas (en paralelo) solo la primera vez; luego React.cache reusa
    const allProducts = await fetchAllByCategory(category, sort)

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
  const data = await fetchPage(page, limit, sort)
  const all = data.data.map(mapDropeaProduct)

  return {
    items: all.filter(p => p.isPublic),
    total: data.total,
    currentPage: data.current_page,
    lastPage: data.last_page,
    perPage: data.per_page,
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
