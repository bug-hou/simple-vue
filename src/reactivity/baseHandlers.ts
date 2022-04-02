import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

// 在一个createGetter/Setter函数中会产生闭包，所以可以使用缓存
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const readonlySet = createSetter(true);

// 根据readonly是否为true来确定isReactive/isReadonly
function createGetter(isReadonly: boolean = false) {
  return function get(target, key, receiver) {
    const result = Reflect.get(target, key, receiver);
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    // 如果只是一个可读属性没有必要收集依赖
    if (!isReadonly) {
      // 依赖收集
      track(target, key);
    }

    return result;
  }
}

function createSetter(isReadonly: boolean = false) {
  return function set(target, key, value, receiver) {
    if (isReadonly) {
      throw new SyntaxError("当前对象设置为只读不能修改");
    }
    const result = Reflect.set(target, key, value, receiver);
    // 触发依赖
    trigger(target, key)

    return result
  }
}

export const mutableHandlers = {
  get,
  set,
}

export const readonlyHandlers = {
  get: readonlyGet,
  set: readonlySet,
}