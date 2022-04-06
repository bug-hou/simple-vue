import { RenderOptions } from "../runtime-dom/type";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp";
import { Container, Instance, VNode } from "./type/index.type"
import { Fragment, Text } from "./vnode";

/* 
  允许用户自定义编译函数，重新createElement,patchProp,insert
*/
export function createRenderer(options: RenderOptions) {
  const {
    createElement,
    patchProp,
    insert
  } = options;
  function render(vnode: VNode, container: Container, parentInstance: Instance | null) {
    // patch
    /* 
      主要创建一个instance实例
      执行实例中的setup
      获取到实例中的render函数
      又对render进行patch
    */
    patch(vnode, container, parentInstance)
  }

  function patch(vnode: VNode, container: Container, parentInstance: Instance | null) {
    const { shapeFlag, type } = vnode;
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentInstance)
        break;
      case Text:
        processText(vnode, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理非组件vnode
          processElement(vnode, container, parentInstance)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件vnode({setup})等
          processComponent(vnode, container, parentInstance)
        }
        break;
    }
  }

  // 处理文档碎片
  function processFragment(vnode: VNode, container: Container, parentInstance: Instance | null) {
    mountChildren(vnode.children as any, container, parentInstance)
  }

  function processText(vnode: VNode, container: Container) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children as string) as any);
    container.appendChild(textNode);
  }

  // 实例化元素
  function processElement(vnode: VNode, container: Container, parentInstance: Instance | null) {
    // init -> 
    mountElement(vnode, container, parentInstance)
  }
  // 挂载元素
  function mountElement(vnode: VNode, container: Container, parentInstance: Instance | null) {
    // 结构数据
    const { type, props, children, shapeFlag } = vnode;
    // 生成对应的元素
    const el = (vnode.el = createElement(type as string));
    // 处理对应的属性添加
    for (const key in props) {
      /* 
        要判断处理的prop是否为一个事件函数
        onClick/onMousedown
      */
      patchProp(el, key, props[key])
    }
    // 当vnode的children不为数组时
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = (children as string) ?? "";
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren((children as VNode[]), el, parentInstance);
    }
    // 挂载到父组件中/根组件中
    /* 
      最后挂载，节约性能，不会造成回流
    */

    // container.appendChild(el);
    insert(el, container)
  }

  // 挂载子组件
  function mountChildren(children: VNode[], container: HTMLElement, parentInstance: Instance | null) {
    children.forEach(component => {
      patch(component, container, parentInstance);
    })
  }

  function processComponent(vnode: VNode, container: Container, parentInstance: Instance | null) {
    // 实例化组件
    mountComponent(vnode, container, parentInstance)
  }

  function mountComponent(vnode: VNode, container: Container, parentInstance: Instance | null) {
    // 创建一个组件实例
    const instance = createComponentInstance(vnode, parentInstance);
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
    patch(subTree, container, instance);
    // 挂载DOM元素
    vnode.el = subTree.el;
  }
  // 利用闭包返回render函数
  return {
    createApp: createAppApi(render)
  }
}

