# 为什么有 Atomic Request ?

微服务盛行的时代，服务端开发人员往往不会关注前端界面需要什么数据，他们只关心自己的服务是否单一，所以设计出来的 OpenAPI 都是原子化的。

这对于前端开发非常不友好，经常因为接口粒度无法满足表单提交或者数据显示需求而扯皮，从而浪费大量的时间。

那么能不能有一种方式可以简单地组合或者串联几个 API，让前端开发不写那么多胶水代码？这便是 Atomic Request 诞生的原因。

Atomic Request 通过简单地配置任务流来达到满足 OpenAPI 编排和聚合的效果。

## 功能特性

☑️ 支持并行的请求编排  
☑️ 支持串行的请求编排  
☑️ 支持灵活地定义接口的参数依赖  
☑️ 不限制具体的请求库，可以用 XHR、Fetch、axios，只要请求函数能够满足 [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) 规范即可接入  
☑️ 支持熔断机制，但配置 stopOnFailed 参数时，只要任务流有一个接口失败了，便不会往下请求   
☑️ 支持重试机制，并可以根据不同接口制定不同的重试次数  
<!-- ☑️ 数据处理，支持多个请求数据的聚合、排序、分组等   -->

## 安装

使用 npm:
```shell
$ npm install atomic-request
```

使用 yarn:
```shell
$ yarn add atomic-request
```

使用 pnpm:
```shell
$ pnpm add atomic-request
```
