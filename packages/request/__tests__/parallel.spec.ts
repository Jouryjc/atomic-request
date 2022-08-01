import { beforeEach, describe, expect, test, vi } from 'vitest'
import { atomicRequest } from '../src/index'
import './mockServer'

let fetchSpy = vi.spyOn(globalThis, 'fetch')
let A = () => fetch('https://example.com?text=A')
let B = () => fetch('https://example.com?text=B')
let C = () => fetch('https://example.com?text=C')
let isRetry = false
let retryTimes = 3

function selfFetch(): Promise<Response> {
  return new Promise(async (resolve, reject) => {
    let res

    if (!isRetry) {
      res = await fetch('https://example.com?status=400')
    } else {
      res = await fetch('https://example.com?text=retry')
    }

    if (res.status >= 200 && res.status < 299) {
      resolve(res)
    } else {
      --retryTimes
      isRetry = retryTimes === 0
      reject(res)
    }
  })
}

describe('parallel process', () => {
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch')
    isRetry = false
    retryTimes = 3

    A = () => fetch('https://example.com?text=A')
    B = () => fetch('https://example.com?text=B')
    C = () => fetch('https://example.com?text=C')
  })

  test('A, B, and C request success at the same time', async () => {
    await atomicRequest(
      [
        {
          request: A,
          name: 'A',
        },
        {
          request: B,
          name: 'B',
        },
        {
          request: C,
          name: 'C',
        },
      ],
      {
        type: 'parallel',
      },
    )

    expect(fetchSpy).toHaveBeenCalledTimes(3)
  })

  test('A, B, and C request success at the same time, get result', async () => {
    const { result } = await atomicRequest(
      [
        {
          request: A,
          name: 'A',
        },
        {
          request: B,
          name: 'B',
        },
        {
          request: C,
          name: 'C',
        },
      ],
      {
        type: 'parallel',
      },
    )

    expect(result.length).toBe(3)
    expect(await result[0].text()).toBe('A')
  })

  test('A, B success but C fail', async () => {
    C = () => selfFetch()

    const { result } = await atomicRequest(
      [
        {
          request: A,
          name: 'A',
        },
        {
          request: B,
          name: 'B',
        },
        {
          request: C,
          name: 'C',
        },
      ],
      {
        type: 'parallel',
      },
    )

    expect(fetchSpy).toHaveBeenCalledTimes(3)
    expect(result.length).toBe(3)
  })

  test('A, B success but C fail, retry 3 times', async () => {
    C = () => selfFetch()

    const { result } = await atomicRequest(
      [
        {
          request: A,
          name: 'A',
        },
        {
          request: B,
          name: 'B',
        },
        {
          request: C,
          name: 'C',
          retryTimes: retryTimes,
        },
      ],
      {
        type: 'parallel',
      },
    )

    expect(fetchSpy).toHaveBeenCalledTimes(6)
    expect(result.length).toBe(3)
  })
})
