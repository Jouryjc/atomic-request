import { useQueue, genAsyncFn } from './queue'
import { validate } from './options'
import { getDefaultOptions } from './options'
import type { RequestAllConfig, RequestFn, RequestConfig, Return, IRequestOptions } from './type'

export async function atomicRequest<T extends RequestConfig>(requestArr: T[], options?: IRequestOptions) {
  const config: RequestAllConfig = Object.create(null)
  Object.assign(config, getDefaultOptions(), options ?? {})

  validate(config)

  const reqQueue = useQueue()
  const formattedReqArr = formatRuqestArr(requestArr)

  const run = async (): Promise<Return<T[]>> => {
    if (config?.type === 'parallel') {
      await reqQueue.parallelRun(formattedReqArr)
    } else {
      reqQueue.add(formattedReqArr.map(item => genAsyncFn(item, config)))
      await reqQueue.run()
    }

    const { result, resultMap } = reqQueue

    return {
      result,
      resultMap,
    }
  }

  if (config.manual === true) {
    return await {
      run,
    }
  } else {
    return await run()
  }
}

export function formatRuqestArr(requestArr): RequestConfig[] {
  if (!Array.isArray(requestArr)) {
    return []
  }

  let formattedReqArr = requestArr.map(requestItem => {
    if (typeof requestItem === 'function') {
      const req: RequestConfig = {
        name: requestItem.name,
        request: requestItem as unknown as RequestFn,
        retryTimes: (requestItem as unknown as RequestFn)?.retryTimes ?? 0,
      }

      return req
    }

    return requestItem
  })

  return formattedReqArr
}
