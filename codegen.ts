import type { CodegenConfig } from '@graphql-codegen/cli'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local' })

const ENDPOINT = 'https://api.dropea.com/graphql/dropshippers'

const config: CodegenConfig = {
  schema: {
    [ENDPOINT]: {
      headers: {
        'x-api-key': process.env['DROPEA_API_KEY'] ?? '',
      },
    },
  },
  generates: {
    './src/lib/dropea/__generated__/schema.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        strictScalars: true,
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
}

export default config
