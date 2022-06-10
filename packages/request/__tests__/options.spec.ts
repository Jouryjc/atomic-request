import { describe, expect, test } from 'vitest'
import { IRequestOptions, validate } from '../src/options'

describe('check options', () => {
  test('stopOnFailed data type', () => {
    const obj: IRequestOptions = {
      stopOnFailed: 'aa',
    }

    expect(validate(obj)).toMatchInlineSnapshot(`
      [
        {
          "instancePath": "/stopOnFailed",
          "keyword": "type",
          "message": "must be boolean",
          "params": {
            "type": "boolean",
          },
          "schemaPath": "#/properties/stopOnFailed/type",
        },
      ]
    `)
  })
})
