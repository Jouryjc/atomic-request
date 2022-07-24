import { req1, req2, req3, req4, failedReq, failedReq2 } from './common'
import { atomicRequest } from '@jour/atomic-request'

export async function serialDemo() {
  // const result1 = await atomicRequest([
  //   {
  //     request: req1
  //   }, {
  //     request: req2
  //   }
  // ], {
  //   type: 'serial'
  // })
  // console.log('最简单串行用法', result1)

  // const result2 = await atomicRequest([
  //   {
  //     request: req1
  //   }, {
  //     request: failedReq
  //   }, {
  //     request: req2
  //   }
  // ], {
  //   type: 'serial',
  //   stopOnFailed: true
  // })
  // console.log('有一个请求失败了，就不继续后续的请求', result2)

  const result3 = await atomicRequest(
    [
      {
        request: req1,
      },
      {
        request: failedReq2,
        retryInterval: [1000, 3000],
      },
      {
        request: req2,
      },
    ],
    {
      type: 'serial',
      retryOnFailed: true,
    },
  )
  console.log('请求重试，但是它还是失败了', result3)

  // const result3 = await atomicRequest(
  //   [
  //     {
  //       name: 'first',
  //       request: req1,
  //       async dependentParams(res) {
  //         return await res.data
  //       },
  //     },
  //     {
  //       name: 'second',
  //       dependsOn: ['first'],
  //       request: req4,
  //       async dependentParams(res) {
  //         return await res.data
  //       },
  //     },
  //     {
  //       name: 'third',
  //       dependsOn: ['first', 'second'],
  //       request: req4,
  //     },
  //   ],
  //   {
  //     type: 'serial',
  //   },
  // )
  // console.log('参数传递，将第一个请求的结果传给第二个请求', result3)
}
