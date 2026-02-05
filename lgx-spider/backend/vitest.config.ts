import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@utils': resolve(__dirname, './src/utils'),
      '@middlewares': resolve(__dirname, './src/middlewares'),
      '@models': resolve(__dirname, './src/models'),
      '@modules': resolve(__dirname, './src/modules'),
    },
  },
  test: {
    coverage: {
      exclude: [
        './src/utils/morgan.ts',
        './src/utils/express.ts',
        './src/utils/database.ts',
        './src/server.ts',
        './vitest.config.ts',
        './test',
      ],
    },
  }
})