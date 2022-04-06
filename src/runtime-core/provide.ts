import { getCurrentInstance } from "./component";

/* 
所以provide只能在setup中使用
*/
export function provide(key, value) {
  const instance = getCurrentInstance();
  if (instance) {
    // 将属性添加到provides对象中
    let { parent } = instance;
    /* 
      创建provides的原型链
    */
    if (instance.provides === instance.parent?.provides) {
      instance.provides = Object.create(parent?.provides ?? null)
    }

    instance.provides[key] = value;
  }
}