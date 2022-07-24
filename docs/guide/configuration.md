# 配置说明

## 公共配置
- 加 <span class="required">*</span> 字段为必选字段

| 属性 | 说明 | 类型 | 默认值 |
|  :-  | :-  | :- | :-  |
| type  | 请求类型，parallel 并行请求，serial 串行请求 | `serial` \| `parallel` | `serial`  |
| manual  | 手动发起请求 |   boolean   | false |
| retryOnFailed  | 熔断机制，失败就停止请求 |   boolean   | false |
| stopOnFailed  | 重试机制，请求失败可以重新请求 |   boolean   | true |

```js
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
```

## 单接口请求配置
- 加 <span class="required">*</span> 字段为必选字段

| 属性 | 说明 | 类型 | 默认值 |
|  :-  | :-  | :- | :-  |
| name  | 请求函数，作为获取结果的key | string | -  |
| request <span class="required">*</span>  | 执行请求的函数 |   `(...args) => Promise<any>`   | - |
| dependsOn  | 依赖哪些接口的结果 |   string[]   | - |
| dependentParams  | request的请求结果，用于获取格式化结果 |   `<T>(res: T) => Promise<any>`   | - |
| retryTimes  | 请求失败后重试的次数 |   number   | 1 |
| retryInterval  | 重试间隔 |   `number[]` \| `(() => number[])`   | - |

```js
export interface RequestConfig {
  /** 请求函数，作为获取结果的key */
  name: string
  /** 执行请求的函数 */
  request: (...args) => Promise<any>
  /** 依赖哪些接口的结果 */
  dependsOn?: string[]
  /** 当前request的请求结果，输出后面request请求依赖的参数 */
  dependentParams?: <T>(res: T) => Promise<any>
  /** 请求失败后重试的次数 */
  retryTimes?: number
  /** 重试间隔 */
  retryInterval?: number[] | (() => number[])
}
```

<style>

table {
    font-size: 14px;
    line-height: 20px;
}

.vp-doc table td:nth-of-type(3), .required {
    color: #c41d7f;
}

.vp-doc table code {
    margin: 0 1px;
    padding: 0.2em 0.4em;
    font-size: .9em;
    color: #c41d7f;
    background: #f2f4f5;
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 3px;
}

table th:nth-of-type(2) {
    width: 200pt;
}
table th:nth-of-type(3) {
    width: 150pt;
}
</style>