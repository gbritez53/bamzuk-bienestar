// src/lib/dropea/orders.ts
// Service layer — queries de órdenes contra Dropea
// Úsalo solo desde Server Components / Server Actions / route handlers (server-only)

import { getDropeaClient } from './client'
import { GET_ORDER_BY_ID_QUERY } from './queries/orders'
import { mapDropeaOrderTracking } from './mappers'
import type { DropeaRawOrderTrackingPagination, OrderTracking } from './types'

/**
 * Trae el tracking + email del cliente de una orden puntual. Se usa desde
 * el webhook de Dropea (ver src/app/api/webhooks/dropea/route.ts) para
 * mandar el mail de seguimiento apenas Dropea le asigna transportista.
 */
export async function getOrderTracking(orderId: number): Promise<OrderTracking | null> {
  const client = getDropeaClient()
  const data = await client.request<{ orders: DropeaRawOrderTrackingPagination }>(
    GET_ORDER_BY_ID_QUERY,
    { id: [orderId] },
  )
  const raw = data.orders.data[0]
  return raw ? mapDropeaOrderTracking(raw) : null
}
