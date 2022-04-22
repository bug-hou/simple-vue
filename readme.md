# small-vue 说明文档

## 环境搭建

### jest 单元测试环境搭建

1. 安装插件
   - typescript:提供 ts 环境
   - jest:测试模块
   - babel-jest,@babel/preset-env,@babel/preset-typescipt:对测试代码进行转化
2. 添加脚本命令
   - `json test:"jest"`

## 目录介绍

1. reactivity:响应式 api 模块开发
   - effect:收集依赖，当数据发生改变时，重新执行
   - reactive:主要是 reactive，readonly，isReadonly···等 api 开发
   - ref:主要为 ref 创建
   - computed:计算属性

```
模块说明：
reactive主要使用proxy对数据进行代理，返回代理的对象，在get时收集依赖，set时触发依赖，当代理的属性为对象时递归进行代理，使用flag对reactive或者readonly进行标志，使用isReadonly来判断时，判断标志即可

readonly调用set函数时，就throw一个错误

ref使用

```

## 开发

1. 开发响应式模块(reactive)
   - reactive:对数据进行代理，返回代理后的数据
   - effect:对数据的副作用进行存储，存储在 weakMap 中

## api

1. 响应式对象
   - reactive:通过 proxy 进行代理
   - readonly:通过 proxy 进行代理
   - shallowReadonly:通过 proxy 进行代理
   - ref:通过 set/get 对属性进行挟持
   - isRective:判断 flags 标识是否存在
   - isReadonly:判断 flags 标识是否存在
   - isProxy:判断 flags 标识是否存在
   - isRef:判断 flags 标识是否存在
   - unRef:通过 isRef 判断是否调用.value 属性
   - proxyRefs:将被使用 ref 包裹的属性不用通过.value 获取，一般使用在 template 模板中
2. computed 计算属性
   - 缓存:将 effect 也添加到 trace 中，只要监听到发送改变，就让 cache 缓存失效，重新获取
3. runtime-core 将 VNODE 转化为真实 DOM

   - patch:判断为 element 还是为 component 决定是 createElement 还是递归 patch
   - h:根据函数中的参数生成 VNODE 对象
   - render:调用 h 函数，获取到组件对应的所有的 VNODE 对象
   - createApp:一个函数返回一个对象

4. 实现模块

   #### runtime-core

   - [x] 支持组件类型
   - [x] 支持 element 类型
   - [x] 初始化 props
   - [x] setup 可获取 props 和 context
   - [x] 支持 component emit
   - [x] 支持 proxy
   - [x] 可以在 render 函数中获取 setup 返回的对象
   - [x] nextTick 的实现
   - [x] 支持 getCurrentInstance
   - [x] 支持 provide/inject
   - [x] 支持最基础的 slots
   - [x] 支持 Text 类型节点
   - [x] 支持 $el api

   #### reactivity

   目标是用自己的 reactivity 支持现有的 demo 运行

   - [x] reactive 的实现
   - [x] ref 的实现
   - [x] readonly 的实现
   - [x] computed 的实现
   - [x] track 依赖收集
   - [x] trigger 触发依赖
   - [x] 支持 isReactive
   - [x] 支持嵌套 reactive
   - [x] 支持 toRaw
   - [x] 支持 effect.scheduler
   - [x] 支持 effect.stop
   - [x] 支持 isReadonly
   - [x] 支持 isProxy
   - [x] 支持 shallowReadonly
   - [x] 支持 proxyRefs
