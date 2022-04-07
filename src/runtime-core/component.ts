import { proxyRefs } from "../reactivity";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";
import { Component, Instance, VNode } from "./type/index.type";


export function createComponentInstance(vnode: VNode, parent: Instance | null): Instance {

  /* 
  通过vnode生成component组件实例:instance
  */
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    slots: {},
    provides: parent?.provides ?? {},
    // 避免每次原型链深度访问
    parent: parent,
    isMounted: false,
    emit: () => { }
  }

  component.emit = emit.bind(null, component) as any;

  return component;
}

export function setupComponent(instance: Instance) {
  /* 
  只有component节点才能进行到这里
  在component节点的vnode中自包含三个属性
  component,
  props,
  children:children主要处理slot插槽
  */
  // 先处理vnode中的props属性
  initProps(instance, instance.vnode.props);
  // 在处理vnode中的children属性
  initSlots(instance, instance.vnode.children ?? "");
  // 初始化一个有状态的setup对象
  setupStatefulComponent(instance);
}

/* 
执行setup函数
*/
function setupStatefulComponent(instance: Instance) {
  const Component = instance.type;

  /* 
    在模板中使用this
  */
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

  if (typeof Component !== "string") {
    const { setup } = Component as Component
    let setupResult: any;
    if (setup) {
      // 执行setup函数
      /* 
        确保props属性只读
      */
      //  在setup执行之前赋值
      setCurrentInstance(instance);
      setupResult = setup.call(null, shallowReadonly(instance.props), { emit: instance.emit });
      // setup执行完毕后删除
      setCurrentInstance(null);
    }
    handleSetupResult(instance, setupResult ?? {});
  }

}

function handleSetupResult(instance: Instance, setupResult: Function | object) {
  /* 
    执行了setup获取到返回值，判断返回的类型:function|object
    */
  if (typeof setupResult === "function") {
    instance.setupState = setupResult();
  } else {
    instance.setupState = proxyRefs(setupResult)
  }

  finishComponentSetup(instance)
}

// 将组件中的render函数赋值到实例中
function finishComponentSetup(instance: Instance) {
  if (typeof instance.type !== "string") {
    const Component = instance.type as Component;
    instance.render = Component?.render;
  }
}
// 通过getCurrentInstance获取的instance实例
let currentInstance: Instance | null;

export function getCurrentInstance() {
  return currentInstance;
}

function setCurrentInstance(instance: Instance | null = null) {
  currentInstance = instance;
}

