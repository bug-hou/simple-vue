import { hasChange, isObject } from "../shared";
import { track, trigger } from "./effect";
import { reactive } from "./reactive";
import { ReactiveFlags } from "./reactive"

class Ref {
  private _value: any
  private _rawValue: any;
  public [ReactiveFlags.IS_REF] = true;
  constructor(value) {
    this._rawValue = value;
    // 当value为一个对象时，使用reactive对value进行代理
    this._value = convert(value);
  }
  get value() {
    track(this, "_value");
    return this._value
  }
  set value(val) {
    if (hasChange(val, this._rawValue)) return;
    this._value = convert(val);
    this._rawValue = val;
    trigger(this, "_value")
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new Ref(value)
}

export function isRef(value) {
  return !!value[ReactiveFlags.IS_REF]
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key] && !isRef(value))) {
        return target[key].value = value;
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}