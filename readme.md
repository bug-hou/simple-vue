# small-vue 说明文档

## 环境搭建

## jest 单元测试环境搭建

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
