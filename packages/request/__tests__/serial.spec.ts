import { beforeEach, describe, expect, test, vi } from 'vitest'
import { atomicRequest } from '../src/index'
import type { RequestFn } from '../src'
import './mockServer'

let fetchSpy = vi.spyOn(globalThis, 'fetch')
let A = () => fetch('https://example.com?text=A')
let B: RequestFn = () => fetch('https://example.com?text=B')
let C = () => fetch('https://example.com?text=C')
let isRetry = false
let retryTimes = 3

export function selfFetch(canRetry = false): Promise<Response> {
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
      isRetry = canRetry
      reject(res)
    }
  })
}

describe('serial process', () => {
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch')
    isRetry = false
    retryTimes = 3

    A = async () => {
      return fetch('https://example.com?text=A')
    }
    B = () => fetch('https://example.com?text=B')
    C = () => fetch('https://example.com?text=C')
  })

  test('A->B->C request success, fetch must be called 3 times', async () => {
    await atomicRequest([
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
    ])

    expect(fetchSpy).toBeCalledTimes(3)
  })

  test('A->B->C request success, get ok result', async () => {
    const {
      result: [aRes, bRes, cRes],
    } = await atomicRequest([
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
    ])

    expect(aRes.ok).toBe(true)
    expect(bRes.ok).toBe(true)
    expect(cRes.ok).toBe(true)

    const aText = await aRes.text()
    const bText = await bRes.text()
    const cText = await cRes.text()

    expect(aText).toBe('A')
    expect(bText).toBe('B')
    expect(cText).toBe('C')
  })

  test('A->B->C, B request failed, C cant make a request', async () => {
    B = () => selfFetch()

    await atomicRequest([A, B, C])

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  test('A->B->C, B request failed, get A and B result', async () => {
    B = () => selfFetch()

    const {
      result: [aRes, bRes],
    } = await atomicRequest([
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
    ])
    const aText = await aRes.text()

    expect(aText).toBe('A')
    expect(bRes.status).toBe(400)
  })

  test('A->B->C, B request failed but resolve result, C can make a request', async () => {
    B = () => fetch('https://example.com?status=400')

    await atomicRequest([
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
    ])

    expect(fetchSpy).toHaveBeenCalledTimes(3)
  })

  test('A->B->C, B request failed, get A and B result', async () => {
    B = () => fetch('https://example.com?status=400')

    const {
      result: [aRes, bRes, cRes],
    } = await atomicRequest([
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
    ])

    const aText = await aRes.text()
    const bText = await bRes.status
    const cText = await cRes.text()

    expect(aText).toBe('A')
    expect(bText).toBe(400)
    expect(cText).toBe('C')
  })

  test('A->B->C, B request failed and get rejected result, C still make a request', async () => {
    B = () => selfFetch()

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
        stopOnFailed: false,
        retryOnFailed: false,
      },
    )

    expect(fetchSpy).toHaveBeenCalledTimes(3)
  })

  test('A->B->C, B request failed and get rejected result, but B can retry request and success, so C can make request', async () => {
    B = () => selfFetch(true)

    await atomicRequest(
      [
        {
          request: A,
          name: 'A',
        },
        {
          request: B,
          name: 'B',
          retryTimes: 1,
        },
        {
          request: C,
          name: 'C',
        },
      ],
      {
        stopOnFailed: false,
        retryOnFailed: true,
      },
    )

    expect(fetchSpy).toHaveBeenCalledTimes(4)
  })

  test('A->B->C, B request failed and get rejected result, but B can retry request and success, so C can make request', async () => {
    B = () => {
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

    const {
      result: [aRes, bRes, cRes],
    } = await atomicRequest(
      [
        {
          request: A,
          name: 'A',
        },
        {
          request: B,
          name: 'B',
          retryTimes: 3,
        },
        {
          request: C,
          name: 'C',
        },
      ],
      {
        stopOnFailed: false,
        retryOnFailed: true,
      },
    )

    expect(fetchSpy).toHaveBeenCalledTimes(6)

    const aText = await aRes.text()
    const bText = await bRes.text()
    const cText = await cRes.text()

    expect(aText).toBe('A')
    expect(bText).toBe('retry')
    expect(cText).toBe('C')
  })
})
