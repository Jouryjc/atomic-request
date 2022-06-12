# Request

> 用于在浏览器做多个接口的流程编排和数据聚合

[![CI](https://github.com/Jouryjc/atomic-requests/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Jouryjc/atomic-requests/actions/workflows/ci.yml)

## ✨ 功能

- [x] 支持并行的请求模式
- [x] 支持串行的请求编排
- [x] 能够灵活定义接口依赖
- [x] 不限制具体的请求库，可以用 XHR、Fetch、axios，只要请求函数能够满足 Promise 规范即可接入
- [x] 支持熔断机制
- [x] 支持重试机制，可以根据不同接口制定不同的重试次数
- [ ] 数据处理，支持多个请求数据的聚合、排序、分组等

##  🎇 Repobeats
![Alt](https://repobeats.axiom.co/api/embed/3a281333d1b629dfec0ef4bbf2cc493453c66d73.svg "Repobeats analytics image")
