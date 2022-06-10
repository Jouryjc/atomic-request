import type { RollupOptions } from 'rollup'
import { resolve } from 'path'
import type { Options as ESBuildOptions } from 'rollup-plugin-esbuild'
import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'

const esbuildPlugin = esbuild()
const esbuildMinifer = (options: ESBuildOptions) => {
  const { renderChunk } = esbuild(options)

  return {
    name: 'esbuild-minifer',
    renderChunk,
  }
}

const configs: RollupOptions[] = [
  {
    input: resolve(__dirname, '../packages/request/src/index.ts'),

    plugins: [esbuildPlugin],

    output: [
      {
        file: resolve(__dirname, '../packages/request/dist/index.mjs'),
        format: 'es',
      },
      {
        file: resolve(__dirname, '../packages/request/dist/index.cjs'),
        format: 'cjs',
      },
      {
        file: resolve(__dirname, '../packages/request/dist/index.iife.min.js'),
        format: 'iife',
        extend: true,
        name: 'atomicRequest',
        globals: {
          ajv: 'ajv',
        },
        plugins: [
          esbuildMinifer({
            minify: true,
          }),
        ],
      },
    ],

    external: ['ajv'],
  },
  {
    input: resolve(__dirname, '../packages/request/src/index.ts'),

    plugins: [dts()],

    output: [
      {
        file: resolve(__dirname, '../packages/request/dist/index.d.ts'),
        format: 'es',
      },
    ],

    external: ['ajv'],
  },

  {
    input: resolve(__dirname, '../packages/aggregation/src/index.ts'),

    plugins: [esbuildPlugin],

    output: [
      {
        file: resolve(__dirname, '../packages/aggregation/dist/index.mjs'),
        format: 'es',
      },
      {
        file: resolve(__dirname, '../packages/aggregation/dist/index.cjs'),
        format: 'cjs',
      },
      {
        file: resolve(__dirname, '../packages/aggregation/dist/index.iife.min.js'),
        format: 'iife',
        extend: true,
        name: 'atomicAggregation',
        globals: {
          dexie: 'Dexie',
        },
        plugins: [
          esbuildMinifer({
            minify: true,
          }),
        ],
      },
    ],

    external: ['dexie'],
  },

  {
    input: resolve(__dirname, '../packages/aggregation/src/index.ts'),

    plugins: [dts()],

    output: [
      {
        file: resolve(__dirname, '../packages/aggregation/dist/index.d.ts'),
        format: 'es',
      },
    ],

    external: ['dexie'],
  },
]

export default configs
