import { beforeEach, describe, expect, test } from 'vitest'
import { combine, createTable } from '../src'
import { CombineItem } from '../src/type'

describe.skip('data aggregation', () => {
  test('pass not array and length less than 2 array', () => {
    expect(combine('asd' as unknown as CombineItem[])).toEqual([])

    expect(
      combine([
        {
          primaryKey: 'id',
          data: [],
          base: true,
        },
      ]),
    ).toEqual([])
  })

  test('combine based on data1 and data2', () => {
    const data1 = [
      {
        id: 1,
        name: 'test',
      },
    ]

    const data2 = [
      {
        key: 1,
        age: 12,
      },
    ]

    const data3 = [
      {
        field: 1,
        type: 'classic',
      },
    ]

    expect(
      combine([
        {
          primaryKey: 'id',
          data: data1,
          base: true,
        },
        {
          primaryKey: 'key',
          data: data2,
        },
        {
          primaryKey: 'field',
          data: data3,
        },
      ]),
    ).toEqual([
      {
        id: 1,
        name: 'test',
        key: 1,
        age: 12,
        field: 1,
        type: 'classic',
      },
    ])
  })
})

describe.skip('data collection operation', async () => {
  let arr: any[] = []
  let { table, bulkAdd } = await createTable('id,name')

  beforeEach(() => {
    for (let i = 0; i < 1000; i++) {
      arr.push({
        id: i,
        name: `name_${i}`,
      })
    }

    bulkAdd(arr)
  })

  test('limit offset query', async () => {
    const result = await table.limit(5).offset(0).toArray()

    expect(result.length).toBe(5)
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "id": 0,
          "name": "name_0",
        },
        {
          "id": 1,
          "name": "name_1",
        },
        {
          "id": 2,
          "name": "name_2",
        },
        {
          "id": 3,
          "name": "name_3",
        },
        {
          "id": 4,
          "name": "name_4",
        },
      ]
    `)
  })

  test('order by desc', async () => {
    const result = await table.orderBy('id').reverse().limit(5).offset(0).toArray()

    expect(result.length).toBe(5)
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "id": 999,
          "name": "name_999",
        },
        {
          "id": 998,
          "name": "name_998",
        },
        {
          "id": 997,
          "name": "name_997",
        },
        {
          "id": 996,
          "name": "name_996",
        },
        {
          "id": 995,
          "name": "name_995",
        },
      ]
    `)
  })
})
