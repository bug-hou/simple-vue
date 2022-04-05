import { ShapeFlags } from "../shared/shapeFlags";
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
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    // 处理非组件vnode
    processElement(vnode, container)
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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
  const { type, props, children, shapeFlag } = vnode;
  // 生成对应的元素
  const el = (vnode.el = document.createElement(type as string));
  // 处理对应的属性添加
  for (const key in props) {
    /* 
      要判断处理的prop是否为一个事件函数
      onClick/onMousedown
    */
    const isOn = key => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      el.addEventListener(key.slice(2).toLowerCase(), props[key]);
    } else {
      el.setAttribute(key, props[key]);
    }
  }
  // 当vnode的children不为数组时
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = (children as string) ?? "";
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren((children as VNode[]), el);
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
  const { proxy, vnode } = instance;
  // 生成渲染树,所以render不能使用箭头函数
  const subTree: VNode = instance.render && instance.render.call(proxy);
  // vnode -> element -> mountElement
  patch(subTree, container);
  // 挂载DOM元素
  vnode.el = subTree.el;
}


