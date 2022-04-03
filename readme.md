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
   - 缓存

<font face="微软雅黑" >微软雅黑字体</font>
<font face="黑体" >黑体</font>
<font size=3 >3 号字</font>
<font size=4 >4 号字</font>
<font color=#FF0000 >红色</font>
<font color=#008000 >绿色</font>
<font color=#0000FF >蓝色</font>
