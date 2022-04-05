import { hasOwn } from "../shared/index";
import { Instance } from "./type/index.type";

const publicPropertiesMap = {
  $el: (i: Instance) => i.vnode.el,
  $slots: (i: Instance) => i.slots
}

export const publicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance as Instance;
    // 先使用setup函数返回值的属性
    /* 
      变量权重setup > data > props
    */
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props || {}, key)) {
      return props && props[key];
    }

    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance);
    }
    // return Reflect.get(target, key, receiver)
  }
}
