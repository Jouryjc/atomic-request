export interface RequestFn {
  (...args): Promise<any>
  retryTimes?: number
  retryInterval?: number[] | (() => number[])
}

export interface RequestConfig {
  /** 请求函数，作为获取结果的key */
  name: string
  /** 执行请求的函数 */
  request: (...args) => Promise<any>
  /** 依赖哪些接口的结果 */
  dependsOn?: string[]
  /** request的请求结果，用于获取格式化结果 */
  outputFn?: <T>(res: T) => Promise<any>
  /** 请求失败后重试的次数 */
  retryTimes?: number
  /** 重试间隔 */
  retryInterval?: number[] | (() => number[])
}
