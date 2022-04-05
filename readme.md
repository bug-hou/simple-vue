# small-vue 说明文档

## 环境搭建

### jest 单元测试环境搭建

1. 安装插件
   - typescript:提供 ts 环境
   - jest:测试模块
   - babel-jest,@babel/preset-env,@babel/preset-typescipt:对测试代码进行转化
2. 添加脚本命令
   - `json test:"jest"`

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
