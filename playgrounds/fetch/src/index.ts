import { atomicRequest } from '@sxf/atomic-request'

const req1 = () => fetch('http://127.0.0.1:9999/axios-success')
const req2 = () => fetch('http://127.0.0.1:9999/axios-success')

const { result, resultMap } = await atomicRequest([req1, req2], { type: 'parallel' })

console.log(result, resultMap)
