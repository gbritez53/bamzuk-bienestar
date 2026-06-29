// src/lib/dropea/queries/orders.ts
// Queries GraphQL de órdenes Dropea.
// Schema descubierto via introspección — campos confirmados.

import { gql } from 'graphql-request'

export const LIST_ORDERS_QUERY = gql`
  query ListOrders($page: Int, $limit: Int) {
    orders(page: $page, limit: $limit) {
      data {
        id
        status
        notes
        created_at
        updated_at
      }
      total
      current_page
      last_page
      per_page
    }
  }
`
