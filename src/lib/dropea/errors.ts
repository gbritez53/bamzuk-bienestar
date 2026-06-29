// src/lib/dropea/errors.ts
// Errores tipados del cliente Dropea (Design Decisión 1)

/**
 * Error de autenticación (401/403).
 * No se reintenta — el API key es inválido o falta.
 */
export class DropeaAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DropeaAuthError'
    // Necesario para que instanceof funcione con transpilación a ES5
    Object.setPrototypeOf(this, DropeaAuthError.prototype)
  }
}

/**
 * Error de servidor 5xx.
 * retry: true — se reintenta hasta 2 veces con backoff exponencial.
 */
export class DropeaServerError extends Error {
  readonly statusCode: number
  readonly retry: boolean = true

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'DropeaServerError'
    this.statusCode = statusCode
    Object.setPrototypeOf(this, DropeaServerError.prototype)
  }
}

/**
 * Error de cliente 4xx (excl. auth).
 * retry: false — no tiene sentido reintentar (la petición es inválida).
 */
export class DropeaClientError extends Error {
  readonly statusCode: number
  readonly retry: boolean = false

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'DropeaClientError'
    this.statusCode = statusCode
    Object.setPrototypeOf(this, DropeaClientError.prototype)
  }
}
