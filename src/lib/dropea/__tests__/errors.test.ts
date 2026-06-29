import { describe, it, expect } from 'vitest'
import { DropeaAuthError, DropeaServerError, DropeaClientError } from '@/lib/dropea/errors'

describe('DropeaAuthError', () => {
  it('es instancia de Error', () => {
    const err = new DropeaAuthError('Unauthorized')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(DropeaAuthError)
  })

  it('tiene el mensaje correcto', () => {
    const err = new DropeaAuthError('API key inválida')
    expect(err.message).toBe('API key inválida')
  })

  it('tiene name = DropeaAuthError', () => {
    const err = new DropeaAuthError('Unauthorized')
    expect(err.name).toBe('DropeaAuthError')
  })

  it('es catcheable como DropeaAuthError', () => {
    expect(() => {
      throw new DropeaAuthError('401')
    }).toThrow(DropeaAuthError)
  })
})

describe('DropeaServerError', () => {
  it('es instancia de Error', () => {
    const err = new DropeaServerError('Internal Server Error', 500)
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(DropeaServerError)
  })

  it('tiene el mensaje y statusCode correctos', () => {
    const err = new DropeaServerError('Service Unavailable', 503)
    expect(err.message).toBe('Service Unavailable')
    expect(err.statusCode).toBe(503)
  })

  it('tiene name = DropeaServerError', () => {
    const err = new DropeaServerError('Internal Server Error', 500)
    expect(err.name).toBe('DropeaServerError')
  })

  it('retry es true (es retriable)', () => {
    const err = new DropeaServerError('Server Error', 500)
    expect(err.retry).toBe(true)
  })

  it('es catcheable como DropeaServerError', () => {
    expect(() => {
      throw new DropeaServerError('500', 500)
    }).toThrow(DropeaServerError)
  })
})

describe('DropeaClientError', () => {
  it('es instancia de Error', () => {
    const err = new DropeaClientError('Not Found', 404)
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(DropeaClientError)
  })

  it('tiene el mensaje y statusCode correctos', () => {
    const err = new DropeaClientError('Bad Request', 400)
    expect(err.message).toBe('Bad Request')
    expect(err.statusCode).toBe(400)
  })

  it('tiene name = DropeaClientError', () => {
    const err = new DropeaClientError('Not Found', 404)
    expect(err.name).toBe('DropeaClientError')
  })

  it('retry es false (NO es retriable)', () => {
    const err = new DropeaClientError('Bad Request', 400)
    expect(err.retry).toBe(false)
  })

  it('es catcheable como DropeaClientError', () => {
    expect(() => {
      throw new DropeaClientError('404', 404)
    }).toThrow(DropeaClientError)
  })
})
