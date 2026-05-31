import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'http://localhost:8000/openapi.json',
  output: {
    path: 'src/client',
    format: 'prettier',
    lint: false,
  },
  plugins: [
    '@hey-api/typescript',
    '@hey-api/client-fetch', // configure ini untuk pakai auth nanti
    'zod',
    '@tanstack/react-query',
    '@hey-api/sdk',
  ],
})
