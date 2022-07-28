import { IRequestOptions } from './options'
import type { RequestConfig } from './type'

type ReturnGenAsyncFn = ReturnType<typeof genAsyncFn>

const requestMap = new Map<string, RequestConfig>()

export const useQueue = () => {
  const list: ReturnGenAsyncFn[] = []
  let result = []

  const resultMap = new Map()

  let index = 0
  let isStop = false

  const add = requestArr => {
    list.push(...requestArr)
  }

  const next = async () => {
    if (index >= list.length - 1 || isStop) {
      console.warn('queue tasks have been execute, no more!')
      return
    }

    const cur = list[++index] as ReturnGenAsyncFn
    const res = await cur({
      next,
      requestMap,
      resultMap,
      stop,
    })
    // 返回来是数组的场景，那么就是子队列，此时直接取最后一个元素即可
    // 失败的话也取最后一次结果，成功的话最后一个元素也是成功的
    result.unshift(Array.isArray(res) ? res.pop() : res)
  }

  const run = async () => {
    const cur = list[index]
    const res = await cur({
      next,
      requestMap,
      resultMap,
      stop,
    })
    result.unshift(Array.isArray(res) ? res.pop() : res)
  }

  const isTailNode = () => {
    return index === list.length - 1
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
    resultMap,
    clean,
  }
}

export const genAsyncFn = (requestItem: RequestConfig, options?: IRequestOptions) => {
  requestMap.set(requestItem.name, requestItem)

  return async ({ next, requestMap, resultMap, stop }): ReturnType<RequestConfig['request']> => {
    let { request, retryTimes = 1, retryInterval, name, dependsOn = [] } = requestItem
    let reqParams: null | Record<string, any> = null

    if (dependsOn.length) {
      reqParams = await getDependOnRes(dependsOn, requestMap, resultMap)
    }

    // 成功了直接进行下一个请求，否则就判断是重试、还是熔断
    try {
      const res = await (reqParams ? request(reqParams) : request())
      resultMap.set(name, res)

      await next()
      return res
    } catch (e) {
      // 重发机制
      if (options?.retryOnFailed === true) {
        // 单个请求如果有重试机制，也可以用队列处理，这里的队列每个请求都是 request 函数
        // 根据 retryTimes 或者 retryInterval 的长度去生成队列，并执行队列中的函数
        try {
          const retryQueue = useQueue()
          retryQueue.add(genRetryQueue())
          await retryQueue.run()

          const result = retryQueue.result
          resultMap.set(name, result)

          // TODO 队列的成功或者失败由整个结果列表决定，不同的请求结果这里判断逻辑不一致

          await next()
          return result
        } catch (e) {
          if (options?.stopOnFailed === false) {
            await next()
          }
          return e
        }

        function genRetryQueue() {
          // 按照顺序依次没有间隔地发送请求
          if (typeof retryInterval === 'undefined') {
            return new Array(retryTimes).fill(-1).map(() => {
              return async ({ next: subNext, stop: subStop }) => {
                try {
                  const res = await request()

                  // 如果请求成功了，就不需要继续往下请求了，终止队列
                  subStop()
                  return res
                } catch (e) {
                  // 重试如果失败了，子队列继续执行
                  await subNext()
                  return e
                }
              }
            })
          }

          // 如果是配置了 retryIntervalArr ，就按照固定间隔重试
          let retryIntervalArr: number[] = []
          if (typeof retryInterval === 'function') {
            retryIntervalArr = retryInterval()
          } else if (typeof retryInterval !== 'undefined') {
            retryIntervalArr = retryInterval
          }

          return retryIntervalArr.map(interval => {
            return async ({ next: subNext, stop: subStop }) => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  request()
                    .then(async value => {
                      subStop()
                      return resolve(value)
                    })
                    .catch(async e => {
                      await subNext()
                      return reject(e)
                    })
                }, interval)
              })
            }
          })
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
    const { dependentParams } = requestMap.get(depend) ?? {}

    if (dependentParams) {
      const res = await dependentParams(resultMap.get(depend))

      // todo 判断res数据类型，做结果拼接
      if (typeof res === 'string') {
        Object.assign(reqParams, {
          res,
        })
      } else if (typeof res === 'object' && res !== null) {
        Object.assign(reqParams, res)
      }
    } else {
      // 不配置 dependentParams 输出格式时，默认导出当前结果集
      Object.assign(reqParams, resultMap.get(depend))
    }
  }

  return reqParams
}
