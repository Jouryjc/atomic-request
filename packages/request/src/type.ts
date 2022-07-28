export interface RequestFn {
  (...args): Promise<any>
  retryTimes?: number
  retryInterval?: number[] | (() => number[])
}

/* 对于整个请求的全局配置 */
export interface RequestAllConfig {
  /* 熔断机制，失败就停止请求 */
  stopOnFailed: boolean
  /* 重试机制，请求失败可以重新请求 */
  retryOnFailed: boolean
  /* 请求类型，parallel 并行请求，serial 串行请求 */
  type: 'parallel' | 'serial'
  /* 手动发起请求 */
  manual: boolean
}
export type IRequestOptions = Partial<RequestAllConfig>

/* 单个请求的配置 */
export interface RequestConfig {
  /** 请求函数，作为获取结果的key */
  name: string
  /** 执行请求的函数 */
  request: (...args) => Promise<any>
  /** 依赖哪些接口的结果 */
  dependsOn?: string[]
  /** request的请求结果，用于获取格式化结果 */
  dependentParams?: <T>(res: T) => Promise<any>
  /** 请求失败后重试的次数 */
  retryTimes?: number
  /** 重试间隔 */
  retryInterval?: number[] | (() => number[])
}

export type GetResultType<T extends RequestConfig[]> = ReturnType<T[number]['request']>

export type Return<T extends RequestConfig[]> = Promise<{
  result: GetResultType<T>
  resultMap: Map<any, any>
}>

export type ReqReturnType<T extends RequestConfig[], U> = Promise<
  U extends IRequestOptions
    ? U['manual'] extends true
      ? Return<T>
      : Promise<{
          run: () => Return<T>
        }>
    : Return<T>
>
