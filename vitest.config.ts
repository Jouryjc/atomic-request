import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    clearMocks: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, 'packages/.test/polyfillFetch.ts'), 'fake-indexeddb/auto'],
    watch: true,
    coverage: {
      enabled: true,
      reporter: ['json', 'lcov', 'text', 'cobertura'],
      excludeNodeModules: true,
      exclude: [],
      include: ['packages/**/*'],
    },
    reporters: ['default'],
  },
})
