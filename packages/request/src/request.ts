import { useQueue, genAsyncFn } from './queue'
import { validate } from './options'
import { getDefaultOptions } from './options'
import type { RequestAllConfig, RequestConfig, Return, IRequestOptions } from './type'

export async function atomicRequest<T extends RequestConfig>(requestArr: T[], options?: IRequestOptions) {
  const config: RequestAllConfig = Object.create(null)
  Object.assign(config, getDefaultOptions(), options ?? {})

  validate(config)

  const reqQueue = useQueue()
  const formattedReqArr = formatRuqestArr(requestArr)

  const run = async (): Promise<Return<any[]>> => {
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

  return requestArr
}
