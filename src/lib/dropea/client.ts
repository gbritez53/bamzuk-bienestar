// src/lib/dropea/client.ts
// GraphQL client para Dropea — SIEMPRE server-side, nunca NEXT_PUBLIC_
// Design Decisión 1: graphql-request + header x-api-key

import { GraphQLClient } from 'graphql-request'

const DROPEA_ENDPOINT = 'https://api.dropea.com/graphql/dropshippers'

function createDropeaClient(): GraphQLClient {
  const apiKey = process.env.DROPEA_API_KEY
  if (!apiKey) {
    throw new Error('DROPEA_API_KEY is not set')
  }
  return new GraphQLClient(DROPEA_ENDPOINT, {
    headers: {
      'x-api-key': apiKey,
    },
  })
}

// Singleton — reutiliza la conexión entre Server Actions del mismo proceso
let _client: GraphQLClient | null = null

export function getDropeaClient(): GraphQLClient {
  if (!_client) {
    _client = createDropeaClient()
  }
  return _client
}

/**
 * Para testing únicamente — permite inyectar un cliente mock o resetear el singleton.
 * Pasar `null` fuerza la recreación del cliente en la próxima llamada a getDropeaClient().
 */
export function __setDropeaClient(client: GraphQLClient | null): void {
  _client = client
}
