import { Instance, VNode } from "./type/index.type";

export function createComponentInstance(vnode: VNode): Instance {

  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
  }

  return component;
}

export function setupComponent(instance: Instance) {
  // initProps();
  // initSlots();
  // 初始化一个有状态的setup对象
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: Instance) {
  const Component = instance.type;

  instance.proxy = new Proxy({}, {
    get(target, key, receiver) {
      const { setupState } = instance;
      if (key in setupState) {
        return setupState[key]
      }
      // return Reflect.get(target, key, receiver)
    }
  })

  if (typeof Component !== "string") {
    const { setup } = Component
    if (setup) {
      // 执行setup函数
      const setupResult = setup();
      handleSetupResult(instance, setupResult);
    }
  }

}

function handleSetupResult(instance: Instance, setupResult: Function | object) {
  if (typeof setupResult === "function") {
    instance.setupState = setupResult();
  } else {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: Instance) {
  if (typeof instance.type !== "string") {
    const Component = instance.type;
    if (Component.render) {
      instance.render = Component.render;
    }
  }
}

