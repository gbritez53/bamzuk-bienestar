// src/lib/dropea/mutations/orders.ts
// Mutations GraphQL de órdenes Dropea.

import { gql } from 'graphql-request'

/**
 * Crea una orden en Dropea.
 * Variables: input (OrderCreateInput!)
 * Se llama SOLO después de pago autorizado (SumUp status=PAID) o COD.
 */
export const CREATE_ORDER_MUTATION = gql`
  mutation OrderCreate($input: OrderCreateInput!) {
    orderCreate(input: $input) {
      id
      status
      total
      createdAt
    }
  }
`

/**
 * Cancela una orden existente.
 * Variables: id (ID!)
 */
export const CANCEL_ORDER_MUTATION = gql`
  mutation OrderCancel($id: ID!) {
    orderCancel(id: $id) {
      id
      status
    }
  }
`
