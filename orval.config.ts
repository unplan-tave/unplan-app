import { config } from 'dotenv';
import { defineConfig } from 'orval';

config({ path: '.env.local', quiet: true });

const openApiSpecUrl = process.env.OPENAPI_SPEC_URL;

if (!openApiSpecUrl) {
  throw new Error('Missing OPENAPI_SPEC_URL. Set it to the Swagger/OpenAPI JSON URL.');
}

export default defineConfig({
  unplanApi: {
    input: openApiSpecUrl,
    output: {
      target: './src/lib/api/endpoints/index.ts',
      schemas: './src/lib/api/model',
      client: 'react-query',
      httpClient: 'axios',
      mode: 'tags-split',
      prettier: true,
      override: {
        mutator: {
          path: './src/lib/api/mutator/orval-mutator.ts',
          name: 'apiMutator',
        },
      },
    },
  },
});
