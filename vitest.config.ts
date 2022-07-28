import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    clearMocks: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, 'packages/.test/polyfillFetch.ts'), 'fake-indexeddb/auto'],
    watch: process.env.TEST_ENV !== 'ci',
    coverage: {
      enabled: process.env.TEST_ENV === 'ci',
      reporter: ['json', 'lcov', 'text', 'cobertura'],
      excludeNodeModules: true,
      exclude: [],
      include: ['packages/**/*'],
    },
    reporters: ['default'],
  },
})
