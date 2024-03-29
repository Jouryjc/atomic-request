import Ajv from 'ajv'
import type { IRequestOptions } from './type'

export { IRequestOptions }

const ajv = new Ajv()

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
    manual: false,
  }
}
