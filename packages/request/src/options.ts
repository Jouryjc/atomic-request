import Ajv from 'ajv'

const ajv = new Ajv()

export interface IRequestOptions {
  /* 熔断机制，失败就停止请求 */
  stopOnFailed?: boolean
  /* 重试机制，请求失败可以重新请求 */
  retryOnFailed?: boolean
  /* 请求类型，parallel 并行请求，serial 串行请求 */
  type?: 'parallel' | 'serial'
  /* 手动发起请求 */
  manual?: boolean
}

export function validate(options) {
  const schema = {
    type: 'object',
    properties: {
      stopOnFailed: {
        type: 'boolean',
      },
      // todo 这哥俩互斥
      retryOnFailed: {
        type: 'boolean',
        default: false,
      },
      type: {
        enum: ['parallel', 'serial'],
      },
      enableDepend: {
        type: 'boolean',
        default: false,
      },
      manual: {
        type: 'boolean',
        default: false,
      },
    },
    required: ['stopOnFailed'],
    additionalProperties: false,
  }

  const validate = ajv.compile(schema)

  return validate(options) ? true : validate.errors
}

export function getDefaultOptions(): IRequestOptions {
  return {
    stopOnFailed: true,
    retryOnFailed: false,
    type: 'serial',
    enableDepend: false,
    manual: false,
  }
}
