import { atomicRequest } from '@sxf/atomic-request'
import { req1, req2, req3, req4, failedReq, failedReq2 } from './common'

export async function parallelDemo() {
  // const result = await atomicRequest([{
  //   request: req1
  // }, {
  //   request: req1
  // }])
  // console.log('最简单并行用法', result)

  // const result2 = await atomicRequest([{
  //   request: req1
  // }, {
  //   request: failedReq
  // }])
  // console.log('并行+失败', result2)

  // const result3 = await atomicRequest([{
  //   request: req1
  // }, {
  //   request: failedReq,
  //   retryTimes: 3,
  // }], {
  //   type: 'parallel'
  // })
  // console.log('并行+失败+重试', result3)

  // const result4 = await atomicRequest([{
  //   request: req1
  // }, {
  //   request: failedReq,
  //   retryTimes: 3,
  // }, {
  //   request: req1,
  // }], {
  //   type: 'parallel'
  // })
  // console.log('并行+失败+重试+多个成功请求', result4)

  const result5 = await atomicRequest(
    [
      {
        request: req1,
      },
      {
        request: failedReq2,
        retryTimes: 3,
      },
      {
        request: req1,
      },
    ],
    {
      type: 'parallel',
    },
  )
  console.log('并行+失败+重试后成功请求', result5)
}
