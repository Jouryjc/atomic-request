import { IRequestOptions } from './options'
import type { RequestConfig } from './type'

type ReturnGenAsyncFn = ReturnType<typeof genAsyncFn>

const requestMap = new Map<string, RequestConfig>()

export const useQueue = () => {
  const list: ReturnGenAsyncFn[] = []
  let result: Promise<any>[] = []

  const resultMap = new Map()

  let index = 0
  let isStop = false

  const add = requestArr => {
    list.push(...requestArr)
  }

  const next = async () => {
    if (index >= list.length - 1 || isStop) {
      // console.warn('queue tasks have been execute, no more!')
      return
    }

    const cur = list[++index] as ReturnGenAsyncFn
    const res = await cur({
      next,
      requestMap,
      resultMap,
    })

    result.unshift(res)
  }

  const run = async () => {
    const cur = list[index]
    result.unshift(
      await cur({
        next,
        requestMap,
        resultMap,
      }),
    )
  }

  const stop = () => {
    isStop = true
  }

  const retry = async () => {
    isStop = false
    await run()
  }

  const goOn = async () => {
    isStop = false
    await next()
  }

  const parallelRun = async (formattedReqArr: RequestConfig[]) => {
    return Promise.allSettled(
      formattedReqArr.map(async requestItem => {
        let { request, retryTimes = 0, name } = requestItem

        try {
          const res = await request()
          result.push(res)
          resultMap.set(name, res)

          return res
        } catch (e) {
          while (retryTimes--) {
            try {
              const res = await request()
              result.push(res)
              resultMap.set(name, res)

              return res
            } catch (e) {
              continue
            }
          }

          result.push(e as Promise<any>)
          return e
        }
      }),
    )
  }

  const clean = () => {
    resultMap.clear()
    result = []
  }

  return {
    add,
    run,
    stop,
    retry,
    goOn,
    parallelRun,
    result,
    clean,
  }
}

export const genAsyncFn = (requestItem, options?: IRequestOptions) => {
  requestMap.set(requestItem.name, requestItem)

  return async ({ next, requestMap, resultMap }) => {
    let { request, retryTimes = 1, name, dependsOn = [] } = requestItem
    let reqParams: null | Record<string, any> = null

    if (dependsOn.length) {
      reqParams = await getDependOnRes(dependsOn, requestMap, resultMap)
    }

    try {
      const res = await (reqParams ? request(reqParams) : request())
      resultMap.set(name, res)

      await next()
      return res
    } catch (e) {
      // 重发机制
      if (options?.retryOnFailed === true) {
        while (retryTimes--) {
          try {
            const res = await (reqParams ? request(reqParams) : request())
            resultMap.set(name, res)

            await next()
            return res
          } catch (e) {
            continue
          }
        }
        // 熔断机制
      } else if (options?.stopOnFailed === false) {
        await next()
      }

      // todo
      return e
    }
  }
}

async function getDependOnRes(
  dependsOn: string[],
  requestMap: Map<string, RequestConfig>,
  resultMap: Map<string, any>,
): Promise<Record<string, any>> {
  let reqParams: Record<string, any> = Object.create(null)

  for await (let depend of dependsOn) {
    const { outputFn } = requestMap.get(depend) ?? {}

    if (outputFn) {
      const res = await outputFn(resultMap.get(depend))

      // todo 判断res数据类型，做结果拼接
      if (typeof res === 'string') {
        Object.assign(reqParams, {
          res,
        })
      } else if (typeof res === 'object' && res !== null) {
        Object.assign(reqParams, res)
      }
    }
  }

  return reqParams
}
