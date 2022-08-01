import { beforeEach, describe, expect, test, vi } from 'vitest'
import { atomicRequest } from '../src/index'
import type { RequestConfig } from '../src'
import './mockServer'

let fetchSpy = vi.spyOn(globalThis, 'fetch')
let A = () => fetch(`https://example.com?json=${JSON.stringify({ hello: 'hello' })}`)
let B = params => fetch(`https://example.com?json=${JSON.stringify(params)}`)
let C = params => fetch(`https://example.com?json=${JSON.stringify(params)}`)

describe('params depend', () => {
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch')

    A = async () => {
      return fetch(`https://example.com?json=${JSON.stringify({ hello: 'hello' })}`)
    }
    B = params => fetch(`https://example.com?json=${JSON.stringify(params)}`)
  })

  test('A->B, pass the result of A to B', async () => {
    B = params => {
      return fetch(`https://example.com?json=${JSON.stringify(params)}`)
    }

    const {
      result: [resA, resB],
    } = await atomicRequest<RequestConfig>([
      {
        name: 'A',
        request: A,
        dependentParams: async res => {
          return {
            B: 'B',
          }
        },
      },
      {
        name: 'B',
        request: B,
        dependsOn: ['A'],
      },
    ])

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(await resA.json()).toMatchInlineSnapshot(`
      {
        "hello": "hello",
      }
    `)
    expect(await resB.json()).toMatchInlineSnapshot(`
      {
        "B": "B",
      }
    `)
  })

  test('A->B->C, pass the result of A and B to C', async () => {
    const {
      result: [resA, resB, resC],
    } = await atomicRequest<RequestConfig>([
      {
        name: 'A',
        request: A,
        dependentParams: async res => {
          return {
            B: 'B',
          }
        },
      },
      {
        name: 'B',
        request: B,
        dependentParams: async res => {
          return {
            C: 'C',
          }
        },
        dependsOn: ['A'],
      },
      {
        name: 'C',
        request: C,
        dependsOn: ['A', 'B'],
      },
    ])

    expect(fetchSpy).toHaveBeenCalledTimes(3)
    expect(await resA.json()).toMatchInlineSnapshot(`
      {
        "hello": "hello",
      }
    `)
    expect(await resB.json()).toMatchInlineSnapshot(`
      {
        "B": "B",
      }
    `)
    expect(await resC.json()).toMatchInlineSnapshot(`
      {
        "B": "B",
        "C": "C",
      }
    `)
  })
})
