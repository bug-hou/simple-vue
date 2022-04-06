import { getCurrentInstance } from "./component";
import { Instance, VNode } from "./type/index.type";

export function inject(key, defaultValue?) {
  const instance = getCurrentInstance();
  if (instance) {
    let { parent } = instance;
    // 从下到上依次访问获取，如果到root没有就使用默认值
    /*     
    while (true) {
      if (parent) {
        const value = parent.provides[key]
        if (value) {
          return value
        } else {
          parent = parent.parent;
        }
      } else {
        return defaultValue;
      }
    }
    */
    return parent?.provides[key] ?? defaultValue;
  }
}