import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@jour/atomic-requests': resolve(__dirname, '../../../packages/request/src/index.ts'),
    },
  },
})