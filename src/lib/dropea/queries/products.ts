// src/lib/dropea/queries/products.ts
// Queries con campos REALES confirmados via exploración — 2026-06-29
// No usar product(id) — no existe. Filtrar con products(id: Int)

import { gql } from 'graphql-request'

export const LIST_PRODUCTS_QUERY = gql`
  query ListProducts($page: Int, $limit: Int, $sort: ProductSortEnum) {
    products(page: $page, limit: $limit, sort: $sort) {
      data {
        id
        name
        sku
        description
        state
        weight
        height
        width
        length
        pvpr
        cost_price
        images
        category
        variants {
          id
          name
          sku
          state
        }
      }
      total
      current_page
      last_page
      per_page
    }
  }
`

export const GET_PRODUCT_BY_ID_QUERY = gql`
  query GetProductById($id: Int!) {
    products(id: $id, limit: 1) {
      data {
        id
        name
        sku
        description
        state
        weight
        height
        width
        length
        pvpr
        cost_price
        images
        category
        variants {
          id
          name
          sku
          state
        }
      }
    }
  }
`
