# 起步

欢迎使用 @sxf/atomic-request，本文档将帮助您快速上手。

## 什么是 Atomic Request ?

> 用于在浏览器端做多个接口的流程编排和数据处理。

## 功能特性

- 支持并行的请求模式
- 支持串行的请求编排
- 能够灵活定义接口依赖
- 不限制具体的请求库，可以用 XHR、Fetch、axios，只要请求函数能够满足 [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) 规范即可接入
- 支持熔断机制
- 支持重试机制，可以根据不同接口制定不同的重试次数
- 数据处理，支持多个请求数据的聚合、排序、分组等

## 安装

使用 npm:
```shell
npm install @sxf/atomic-request
```

使用 yarn:
```shell
yarn add @sxf/atomic-request
```

使用 pnpm:
```shell
pnpm add @sxf/atomic-request
```
