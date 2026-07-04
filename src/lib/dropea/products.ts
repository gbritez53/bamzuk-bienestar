// src/lib/dropea/products.ts
// Service layer — queries de productos contra Dropea
// Úsalo solo desde Server Components / Server Actions (server-only)
// El filtrado por categoría se hace EN MEMORIA porque Dropea no lo soporta en API

import { cache } from 'react'
import { getDropeaClient } from './client'
import { LIST_PRODUCTS_QUERY, GET_PRODUCT_BY_ID_QUERY } from './queries/products'
import { mapDropeaProduct } from './mappers'
import { translateProduct, translateProducts } from './translations'
import type { Product, ProductPage, DropeaRawProductPagination } from './types'

// Dropea capea per_page a 50 aunque pidas más (verificado 2026-07-04:
// limit=250 devuelve per_page=50). Pedir el máximo real y confiar en
// last_page para saber cuántas páginas recorrer.
const MAX_FETCH_PER_PAGE = 50
// Tope de seguridad por si last_page viene corrupto. El catálogo completo
// hoy son ~81 páginas — este valor DEBE ser mayor o el scan pierde productos.
const SAFETY_MAX_PAGES = 200
// Cuántas páginas fetchear en paralelo por tanda (no saturar la API)
const FETCH_CONCURRENCY = 10
// TTL del caché en memoria del scan completo (cross-request, por proceso)
const CATALOG_TTL_MS = 10 * 60 * 1000

type PageResult = DropeaRawProductPagination

/**
 * Solo se venden productos publicados Y con precio de venta cargado:
 * algunos proveedores nunca setean pvpr y el producto saldría a 0,00 €.
 */
function isSellable(p: Product): boolean {
  return p.isPublic && p.pvpr > 0
}

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
 * Escanea el catálogo completo y devuelve los productos vendibles de una
 * categoría. Fetchea en tandas de FETCH_CONCURRENCY páginas en paralelo.
 */
async function scanCatalogByCategory(category: string, sort?: string): Promise<Product[]> {
  const firstPage = await fetchPage(1, MAX_FETCH_PER_PAGE, sort)
  const allPages: PageResult[] = [firstPage]

  const totalPages = Math.min(firstPage.last_page, SAFETY_MAX_PAGES)

  for (let start = 2; start <= totalPages; start += FETCH_CONCURRENCY) {
    const end = Math.min(start + FETCH_CONCURRENCY - 1, totalPages)
    const batch = []
    for (let p = start; p <= end; p++) {
      batch.push(fetchPage(p, MAX_FETCH_PER_PAGE, sort))
    }
    allPages.push(...(await Promise.all(batch)))
  }

  const wanted = category.toLowerCase()
  const allProducts: Product[] = []
  for (const page of allPages) {
    const filtered = page.data
      .map(mapDropeaProduct)
      .filter(p => isSellable(p) && p.category.toLowerCase() === wanted)
    allProducts.push(...filtered)
  }

  return allProducts
}

// Caché en memoria por proceso: el scan completo (~81 requests) es caro,
// no lo repetimos por cada request/usuario. React.cache() solo dedupea
// dentro del mismo render, por eso hace falta esta capa además.
const catalogCache = new Map<string, { products: Product[]; expiresAt: number }>()

/** Para testing únicamente — limpia el caché TTL del catálogo. */
export function __resetCatalogCache(): void {
  catalogCache.clear()
}

const fetchAllByCategory = cache(async (category: string, sort?: string): Promise<Product[]> => {
  const key = `${category.toLowerCase()}|${sort ?? ''}`
  const hit = catalogCache.get(key)
  if (hit && hit.expiresAt > Date.now()) return hit.products

  const products = await scanCatalogByCategory(category, sort)
  catalogCache.set(key, { products, expiresAt: Date.now() + CATALOG_TTL_MS })
  return products
})

export async function listProducts(
  page = 1,
  limit = 40,
  sort?: string,
  category?: string,
  locale = 'es',
): Promise<ProductPage> {
  if (category) {
    const allProducts = await fetchAllByCategory(category, sort)

    const totalFiltered = allProducts.length
    const totalLastPage = Math.ceil(totalFiltered / limit)
    const start = (page - 1) * limit

    return {
      items: translateProducts(allProducts.slice(start, start + limit), locale),
      total: totalFiltered,
      currentPage: page,
      lastPage: totalLastPage,
      perPage: limit,
    }
  }

  // Sin filtro de categoría — consulta normal paginada por Dropea
  const data = await fetchPage(page, limit, sort)

  return {
    items: translateProducts(data.data.map(mapDropeaProduct).filter(isSellable), locale),
    total: data.total,
    currentPage: data.current_page,
    lastPage: data.last_page,
    perPage: data.per_page,
  }
}

export async function getProductById(id: number, locale = 'es'): Promise<Product | null> {
  const client = getDropeaClient()
  const data = await client.request<{ products: { data: DropeaRawProductPagination['data'] } }>(
    GET_PRODUCT_BY_ID_QUERY,
    { id: [id] },
  )
  const raw = data.products.data[0]
  const product = raw ? mapDropeaProduct(raw) : null
  return product ? translateProduct(product, locale) : null
}
