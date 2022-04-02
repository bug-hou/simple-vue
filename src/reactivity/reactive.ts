import { track, trigger } from "./effect";

export function reactive(raw: object): any {
  // 对原数据进行处理
  return new Proxy(raw, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      // 依赖收集
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);

      // 触发依赖
      trigger(target, key)

      return result
    }
  })
}

