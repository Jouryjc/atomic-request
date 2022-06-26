import type { CombineItem } from './type'

const minimumLen = 2
const oneBase = 1

export function combine(arrs: CombineItem[]) {
  if (!Array.isArray(arrs) || arrs.length < minimumLen) {
    console.warn(`combine argument is an array of minimum length ${minimumLen}`)
    return []
  }

  const baseData = arrs.filter(item => item.base)
  const otherData = arrs.filter(item => !item.base)

  if (baseData.length !== oneBase) {
    console.error("dataset can't have more bases!")
    return
  }

  const baseMap = Object.create(null)
  baseData.forEach(({ data, primaryKey }) => {
    data.map(item => {
      baseMap[item[primaryKey]] = item
    })
  })

  const otherMap = Object.create(null)
  otherData.forEach(({ data, primaryKey }, index) => {
    let map = (otherMap[index] = Object.create(null))

    data.map(item => {
      map[item[primaryKey]] = item
    })
  })

  const result: Array<Record<string, any>> = []
  for (let key in baseMap) {
    const res = baseMap[key]

    Object.values<any>(otherMap).forEach(obj => {
      Object.assign(res, obj[key])
    })

    result.push(res)
  }

  return result
}
