// src/lib/dropea/translations.ts
// Capa de traducción de productos para locale PT.
// Los datos vienen de la API de Dropea en español — esta capa permite
// sobreescribir name, description, category y variant names por locale.
// Si no hay traducción para un producto, se conserva el dato original.
//
// ES es el source of truth — translateProduct es no-op para 'es'.

import type { Product } from './types'
import translationsPt from '@/messages/product-translations.pt.json'
import translationsEs from '@/messages/product-translations.es.json'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductTranslation {
  name?: string
  description?: string
  category?: string
  variants?: Record<string, string>
}

type TranslationsMap = Record<string, ProductTranslation>

// ---------------------------------------------------------------------------
// Registry: locale → translations map
// ---------------------------------------------------------------------------

const registry: Record<string, TranslationsMap> = {
  es: translationsEs as TranslationsMap,
  pt: translationsPt as TranslationsMap,
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Traduce un producto según el locale.
 * - locale 'es' → no-op (ES es source of truth)
 * - locale 'pt' → mergea traducciones si existen
 * - Si no hay entrada en el mapa de traducciones → producto intacto
 */
export function translateProduct(product: Product, locale: string): Product {
  if (locale === 'es') return product

  const translations = registry[locale]
  if (!translations) return product

  const entry = translations[product.id]
  if (!entry) return product

  const translated: Product = { ...product }

  if (entry.name !== undefined) {
    translated.name = entry.name
  }

  if (entry.description !== undefined) {
    translated.description = entry.description
  }

  if (entry.category !== undefined) {
    translated.category = entry.category
  }

  if (entry.variants !== undefined) {
    translated.variants = product.variants.map(v => ({
      ...v,
      name: entry.variants![v.id] ?? v.name,
    }))
  }

  return translated
}

/**
 * Traduce un array de productos según el locale.
 * Útil para listados (catálogo, búsqueda).
 */
export function translateProducts(products: Product[], locale: string): Product[] {
  if (locale === 'es') return products

  const translations = registry[locale]
  if (!translations) return products

  return products.map(p => translateProduct(p, locale))
}
