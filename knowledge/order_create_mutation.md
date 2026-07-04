# Guía: cómo construir mutations en la API de Dropea

## Headers

```
POST https://api.dropea.com/graphql/dropshippers
Content-Type: application/json
Accept: application/json
X-API-Key: <tu_api_key>
```

## Formato general

Las mutations NO reciben un objeto "input". Los campos van como argumentos
sueltos de la mutation, cada uno con su propio tipo.

## Ejemplo: orderCreate

Query:

```graphql
mutation CreateOrder(
  $shop_id: Int!
  $payment_method: PaymentMethodEnum!
  $customer: CustomerInputType!
  $products: [OrderProductInputType!]!
) {
  orderCreate(
    shop_id: $shop_id
    payment_method: $payment_method
    customer: $customer
    products: $products
  ) {
    id
    status
    total_amount
  }
}
```

Variables:

```json
{
  "shop_id": 17593,
  "payment_method": "MANUAL",
  "customer": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "+34600000000",
    "address": "Calle Falsa 123",
    "city": "Madrid",
    "zip": "28001",
    "country": "ES"
  },
  "products": [
    { "product_id": 60, "unit_price": 19.99, "quantity": 1, "total_value": 19.99 }
  ]
}
```

## Campos requeridos por tipo

**CustomerInputType:**

- Requeridos: `first_name`, `last_name`, `email`, `phone`, `address`, `city`, `zip`, `country`
- Opcional: `alternative_address`
- `country` solo admite: `ES`, `PT`

**OrderProductInputType** (uno por producto):

- Requeridos: `product_id`, `unit_price`, `quantity`, `total_value`

**payment_method** (enum), valores válidos:
`MANUAL`, `PAID`, `CASH_ON_DELIVERY`, `SHOPIFY_PAYMENTS`, `PAYPAL`, `STRIPE`, `OTHER`

**Campos opcionales de la mutation `orderCreate`:**
`external_order_id` (Int), `external_order_name` (String)

## Recomendación general

Para cualquier mutation, seguí el mismo patrón:

1. Mirá los argumentos que pide la mutation (no hay un "input" único).
2. Cada argumento complejo tiene su propio InputType con sus campos requeridos.
3. Enviá siempre el header `Accept: application/json` para asegurar respuestas en JSON.