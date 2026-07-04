// src/lib/dropea/mutations/orders.ts
// Mutations GraphQL de órdenes Dropea.

import { gql } from 'graphql-request'

/**
 * Crea una orden en Dropea.
 * OJO: la API NO recibe un objeto "input" — cada campo va como argumento
 * suelto con su propio tipo (ver knowledge/order_create_mutation.md).
 * Se llama SOLO después de pago autorizado (SumUp status=PAID) o COD.
 */
export const CREATE_ORDER_MUTATION = gql`
  mutation OrderCreate(
    $shop_id: Int!
    $payment_method: PaymentMethodEnum!
    $customer: CustomerInputType!
    $products: [OrderProductInputType!]!
    $external_order_name: String
  ) {
    orderCreate(
      shop_id: $shop_id
      payment_method: $payment_method
      customer: $customer
      products: $products
      external_order_name: $external_order_name
    ) {
      id
      status
      total_amount
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
