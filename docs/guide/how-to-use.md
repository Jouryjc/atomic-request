# 使用示例

## 基础配置

```js
const { result } = await atomicRequest([
    { request: req1, },
    { request: req2 }
], {
    // 串行
    type: 'serial'
    // 并行
    // type: 'parallel'
})
console.log('最基础用法', result)
// [res1, res2]
```

## 请求失败

- 有一个请求失败了，就不继续后续的请求
```js
const { result } = await atomicRequest(
    [
        { request: req1 },
        { request: failedReq },
        { request: req2 }
    ],
    {
        type: 'serial',
        stopOnFailed: true
    }
)
console.log('有一个请求失败了，就不继续后续的请求', result)
// [res1]
```

## 请求重试

- 请求重试 2 次

```js
const { result } = await atomicRequest(
    [
        {
            request: req1,
        },
        {
            request: failedReq2,
            retryTimes: 2,
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
console.log('请求重试失败', result)
// [res1, res2]
```

- 请求重试：按时间间隔

```js
const { result } = await atomicRequest(
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
console.log('请求重试失败', result)
// [res1, res2]
```

- 请求重试成功

```js
const { result } = await atomicRequest(
    [
        {
            request: req1,
        },
        {
            request: req2,
            retryInterval: [1000, 3000],
        },
        {
            request: req3,
        },
    ],
    {
        type: 'serial',
        retryOnFailed: true,
    },
)
console.log('请求重试成功', result)
// [res1, res2, res3]
```

## 接口数据聚合

- 自定义配置接口聚合规则：原子接口单独定义 provide

```js
const { result } = await atomicRequest(
    [
        {
            request: req1,
            provide: res => {
                const data = res.data || {}
                return {
                    id: data.id,
                    mask: data.details?.mask,
                }
            },
        },
        {
            request: failedReq2,
            retryInterval: [1000, 2000],
            provide: res => {
                const data = res.data || {}
                return {
                    req2Name: data.name,
                    req2Mask: data.details?.mask,
                }
            },
        },
        {
            request: req5,
            provide: res => {
                const data = res.data || {}
                return {
                    req3Name: data.name,
                }
            },
        },
    ],
    {
      type: 'serial',
      retryOnFailed: true,
    },
  )
  console.log('请求重试，但是它还是失败了', result)

// {
//     id: '',
//     mask: '',
//     req2Name: '',
//     req2Mask: '',
//     req3Name: '',
// }
```

- 业务使用示例

```js
// const getNamespacedSecrets = (params: AnyObject) => {
//     return axios.get(`/v3/namespacedsecrets`, { ...params });
// }

private async getList(params: AnyObject) {
    const namespacedSecrets = await atomicRequest([{
        request: () => getCertificates(this.projectId, { ...params }),
        provide: (data: Certificate[]) => {
            return this.$toArray(data);
        }
    }, {
        request: () => getNamespacedSecrets({ ...params }),
        provide: (data: Certificate[]) => {
            return this.$toArray(data).filter(item => {
                return item.type === NAMESPACE_CERTIFICATE;
            });
        }
    }], {
        type: 'parallel'
    });

    return namespacedSecrets;
}
```

- 自定义配置接口聚合规则：统一定义返回结果 dataModel

```js
const result = await atomicRequest(
    [
        {
            request: req1,
        },
        {
            request: failedReq2,
            retryInterval: [1000, 2000],
        },
        {
            request: req5,
        },
    ], {
    type: 'serial',
    retryOnFailed: true,
    dataModel: ([res1, res2, res3] = result) => {
            return {
            id: res1.id,
            mask: res1.name,
            req2Name: res2.name,
            req2Mask: res2.mask,
            req3Name: res3.name,
        }
    }
})
console.log('请求重试，但是它还是失败了', result)

// {
//     id: '',
//     mask: '',
//     req2Name: '',
//     req2Mask: '',
//     req3Name: '',
// }
```

## 串行接口依赖场景

- 接口参数依赖

```js
const { result } = await atomicRequest([{
    //　这里 name 用于做接口标识，定义依赖时会用到
    name: 'workload',
    request: () => getWorkload(this.projectId, this.appId),
}, {
    // 当前接口请求依赖的数据源，可定义多个，跟 name 字段完全匹配
    dependsOn: ['workload'],
    request: (workload: Workload) => {
        return getAiconfigs(this.clusterId, workload.name);
    }
}], {
    type: 'serial',
    stopOnFailed: true
});
```

- 接口参数依赖：自定义依赖数据输出格式

```js
const { result } = await atomicRequest([{
    //　这里 name 用于做接口标识，定义依赖时会用到
    name: 'workload',
    request: () => getWorkload(this.projectId, this.appId),
    // 被后面接口依赖的数据格式自定义
    dependentParams: res => res.name
}, {
    // 当前接口请求依赖的数据源，可定义多个，跟 name 字段完全匹配
    dependsOn: ['workload'],
    request: (res) => {
        // 这里 res 就是上面 dependentParams 输出的自定义格式
        return getAiconfigs(this.clusterId, res.name);
    }
}], {
    type: 'serial',
    stopOnFailed: true
});
```

## 手动触发执行

```js
const request = await atomicRequest([{
    // 被后面接口依赖的数据格式自定义
    name: 'workload',
    request: () => getWorkload(this.projectId, this.appId),
}, {
    // 当前接口请求依赖的数据源，可定义多个，跟 name 字段完全匹配
    dependsOn: ['workload'],
    request: (workload: Workload) => {
        return getAiconfigs(this.clusterId, workload.name);
    }
}], {
    type: 'serial',
    stopOnFailed: true,
    // 手动触发执行
    manual: true
});

const res = await request.run();

window.console.log(res);
```