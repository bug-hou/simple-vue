import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
  IS_REF = "__v_isRef",
}

// 统一处理监听对象
function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}

export function reactive(raw: object): any {
  // 对原数据进行处理
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw: any) {
  return createActiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(raw) {
  return !!raw[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(raw) {
  return !!raw[ReactiveFlags.IS_READONLY]
}

export function isProxy(raw) {
  return isReactive(raw) || isReadonly(raw)
}

