import { createComponentInstance, setupComponent } from "./component"
import { Container, Instance, VNode } from "./type/index.type"

export function render(vnode: VNode, container: Container) {
  // patch
  /* 
    主要创建一个instance实例
    执行实例中的setup
    获取到实例中的render函数
    又对render进行patch
  */
  patch(vnode, container)
}

function patch(vnode: VNode, container: Container) {
  if (typeof vnode.type === "string") {
    // 处理非组件vnode
    processElement(vnode, container)
  } else {
    // 处理组件vnode({setup})等
    processComponent(vnode, container)
  }
}
// 实例化元素
function processElement(vnode: VNode, container: Container) {
  // init -> 
  mountElement(vnode, container)
}
// 挂载元素
function mountElement(vnode: VNode, container: Container) {
  // 结构数据
  const { type, props, children } = vnode;
  // 生成对应的元素
  const el = document.createElement(type as string);
  for (const key in props) {
    el.setAttribute(key, props[key]);
  }
  // 当vnode的children不为数组时
  if (typeof children === "string") {
    el.textContent = children ?? "";
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }
  // 挂载到父组件中/根组件中
  /* 
    最后挂载，节约性能，不会造成回流
  */

  container.appendChild(el);
}

// 挂载子组件
function mountChildren(children: VNode[], container: HTMLElement) {
  children.forEach(component => {
    patch(component, container);
  })
}

function processComponent(vnode: VNode, container: Container) {
  // 实例化组件
  mountComponent(vnode, container)
}

function mountComponent(vnode: VNode, container: Container) {
  // 创建一个组件实例
  const instance = createComponentInstance(vnode);
  // 调用setup函数获取到setup函数return出来的数据
  // 然后作为render函数时this
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: Instance, container: Container) {
  const { proxy } = instance;
  // 生成渲染树
  const subTree = instance.render && instance.render.call(proxy)
  // vnode -> element -> mountElement
  patch(subTree, container);
}


