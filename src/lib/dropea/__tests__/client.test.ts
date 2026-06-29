import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { GraphQLClient } from 'graphql-request'
import { getDropeaClient, __setDropeaClient } from '@/lib/dropea/client'

const DROPEA_ENDPOINT = 'https://api.dropea.com/graphql/dropshippers'

describe('getDropeaClient', () => {
  const originalKey = process.env.DROPEA_API_KEY

  beforeEach(() => {
    // Resetea el singleton antes de cada test
    __setDropeaClient(null)
    delete process.env.DROPEA_API_KEY
  })

  afterEach(() => {
    __setDropeaClient(null)
    if (originalKey !== undefined) {
      process.env.DROPEA_API_KEY = originalKey
    } else {
      delete process.env.DROPEA_API_KEY
    }
  })

  it('lanza error si DROPEA_API_KEY no está seteada', () => {
    expect(() => getDropeaClient()).toThrow('DROPEA_API_KEY is not set')
  })

  it('retorna instancia de GraphQLClient cuando el key existe', () => {
    process.env.DROPEA_API_KEY = 'test-key-123'
    const client = getDropeaClient()
    expect(client).toBeInstanceOf(GraphQLClient)
  })

  it('es singleton: retorna la misma instancia en llamadas repetidas', () => {
    process.env.DROPEA_API_KEY = 'test-key-123'
    const client1 = getDropeaClient()
    const client2 = getDropeaClient()
    expect(client1).toBe(client2)
  })

  it('__setDropeaClient permite inyectar un cliente mock', () => {
    const mockClient = new GraphQLClient('https://mock.dropea.test')
    __setDropeaClient(mockClient)
    const result = getDropeaClient()
    expect(result).toBe(mockClient)
  })

  it('__setDropeaClient con null resetea el singleton', () => {
    process.env.DROPEA_API_KEY = 'test-key-123'
    const client1 = getDropeaClient()
    __setDropeaClient(null)
    // Ahora al borrar la key y reintentar debería lanzar
    delete process.env.DROPEA_API_KEY
    expect(() => getDropeaClient()).toThrow('DROPEA_API_KEY is not set')
  })
})
