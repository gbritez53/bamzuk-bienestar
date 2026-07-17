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

/**
 * Trae una orden puntual con datos de tracking + email del cliente — usado
 * por el webhook de Dropea para mandar el mail de seguimiento (ver
 * src/lib/dropea/orders.ts y src/app/api/webhooks/dropea/route.ts).
 */
export const GET_ORDER_BY_ID_QUERY = gql`
  query GetOrderById($id: [Int]!) {
    orders(id: $id, limit: 1) {
      data {
        id
        status
        tracking_code
        tracking_url
        carrier_company
        customer {
          full_name
          email
          zip
        }
      }
    }
  }
`
