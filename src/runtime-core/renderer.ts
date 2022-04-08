import { effect } from "../reactivity/effect";
import { RenderOptions } from "../runtime-dom/type";
import { EMPTY_OBJ } from "../shared";
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
    insert,
    remove,
    setElementText
  } = options;
  function render(vnode: VNode, container: Container, parentInstance: Instance | null) {
    // patch
    /* 
      主要创建一个instance实例
      执行实例中的setup
      获取到实例中的render函数
      又对render进行patch
    */
    patch(null, vnode, container, parentInstance)
  }

  /* 
  n1:表示新的虚拟节点，
  n2:表示旧的虚拟节点
   */
  function patch(n1: VNode | null, n2: VNode, container: Container, parentInstance: Instance | null, anchor?: HTMLElement) {
    const { shapeFlag, type } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentInstance)
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理非组件n2
          processElement(n1, n2, container, parentInstance, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件n2({setup})等
          processComponent(n1, n2, container, parentInstance);
        }
        break;
    }
  }

  // 处理文档碎片
  function processFragment(n1: VNode | null, n2: VNode, container: Container, parentInstance: Instance | null) {
    mountChildren(n2.children as any, container, parentInstance)
  }

  function processText(n1: VNode | null, n2: VNode, container: Container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children as string) as any);
    container.appendChild(textNode);
  }

  // 实例化元素
  function processElement(n1: VNode | null, n2: VNode, container: Container, parentInstance: Instance | null, anchor?: HTMLElement) {
    if (!n1) {
      // init -> 
      mountElement(n2, container, parentInstance, anchor)
    } else {
      patchElement(n1, n2, container, parentInstance);
    }
  }

  function patchElement(n1: VNode, n2: VNode, container: Container, parentInstance: Instance | null) {
    console.log("patchElement");
    const el = (n2.el = n1.el);
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    // 这里已经在进行patch所有el一定存在
    // 处理子节点
    patchChildren(n1, n2, el as HTMLElement, parentInstance as Instance)
    // 处理props属性
    patchProps(el as HTMLElement, oldProps, newProps)
  }
  function patchChildren(n1: VNode, n2: VNode, container: HTMLElement, parentInstance: Instance) {
    const shapeFlag = n2.shapeFlag;
    const prevShapeFlag = n1.shapeFlag;
    const c1 = n1.children;
    const c2 = n2.children;
    /* 
      这里先判断 数组 => 字符串
    */
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 直接删除原来的节点
        unmountChildren(c1)
      }
      if (c1 !== c2) {
        setElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 之前为字符串时，要对字符串进行清空
        setElementText(container, "")
        // 对新节点进行mount
        mountChildren(c2 as any, container, parentInstance);
      } else {
        // debugger;
        // 新旧节点全是数组
        /* 
          1.先进行双端对比
          获取到中间乱序部分
        */
        patchKeyedChildren(c1 as any, c2 as any, container, parentInstance)
      }
    }
  }
  function patchKeyedChildren(c1: VNode[], c2: VNode[], container: HTMLElement, parentInstance: Instance) {
    let l = 0, oldR = c1.length - 1, newR = c2.length - 1;
    // 左端先对比
    while (l <= oldR && l <= newR) {
      const n1 = c1[l];
      const n2 = c2[l];
      if (isSameVNodeType(n1, n2)) {
        // 如果类型相同直接再次patch属性
        patch(n1, n2, container, parentInstance)
      } else {
        break;
      }
      l++;
    }
    // 右端先对比
    while (l <= oldR && l <= newR) {
      const n1 = c1[oldR];
      const n2 = c2[newR];
      if (isSameVNodeType(n1, n2)) {
        // 如果类型相同直接再次patch属性
        patch(n1, n2, container, parentInstance)
      } else {
        break;
      }
      oldR--;
      newR--;
    }
    // 新的比老的多
    if (l > oldR) {
      let anchor: HTMLElement | undefined;
      if (l + 1 < c2.length && oldR + 1 < c1.length) {
        anchor = c1[oldR + 1].el as HTMLElement
      }
      while (l <= newR) {
        patch(null, c2[l], container, parentInstance, anchor);
        l++;
      }
    } else if (l > newR) {
      while (l <= oldR) {
        remove(c1[l].el as HTMLElement)
        l++;
      }
    } else {
      // 中间对比
      let patched: number = 0;
      const toBePatched = newR - l + 1;
      const keyToNewIndexMap = new Map();
      for (let i = l; i <= newR; i++) {
        const preNode = c2[i];
        if (preNode.key) {
          keyToNewIndexMap.set(preNode.key, i)
        }
      }
      for (let i = l; i <= oldR; i++) {
        const oldNode = c1[i];
        if (patched >= toBePatched) {
          remove(oldNode.el as HTMLElement);
          continue;
        }
        let indexKey: number | undefined;
        if (oldNode.key) {
          if (keyToNewIndexMap.has(oldNode.key)) {
            indexKey = keyToNewIndexMap.get(oldNode.key)
          }
        } else {
          for (let j = l; j < newR; i++) {
            if (isSameVNodeType(oldNode, c2[j])) {
              indexKey = j;
              break;
            }
          }
        }
        if (!indexKey) {
          remove(oldNode.el as HTMLElement);
        } else {
          patch(oldNode, c2[indexKey], container, parentInstance);
          patched++;
        }
      }
    }


    function isSameVNodeType(n1: VNode, n2: VNode): boolean {
      if (n1.key && n2.key) {
        return n1.key === n2.key && n1.type === n2.type
      } else {
        return n1.type === n2.type;
      }
    }
  }
  // 删除元素
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      remove(el);
    }
  }
  // 对比props
  function patchProps(el: HTMLElement, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 先对新的属性进行添加
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          patchProp(el, key, prevProp, nextProp)
        }
      }
      // 对旧的属性进行删除
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            patchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }
  // 挂载元素
  function mountElement(vnode: VNode, container: Container, parentInstance: Instance | null, anchor?: HTMLElement) {
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
      patchProp(el, key, null, props[key])
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
    insert(el, container, anchor)
  }

  // 挂载子组件
  function mountChildren(children: VNode[], container: HTMLElement, parentInstance: Instance | null) {
    children.forEach(component => {
      patch(null, component, container, parentInstance);
    })
  }

  function processComponent(n1: VNode | null, n2: VNode, container: Container, parentInstance: Instance | null) {
    // 实例化组件
    mountComponent(n2, container, parentInstance)
  }

  function mountComponent(vnode: VNode, container: Container, parentInstance: Instance | null) {
    // 创建一个组件实例
    const instance = createComponentInstance(vnode, parentInstance);
    // 调用setup函数获取到setup函数return出来的数据
    // 然后作为render函数时this
    setupComponent(instance);
    setupRenderEffect(instance, container);
  }

  /* 
  只有实例才会执行这个函数，这个是创建实例一部分，所有的h中的type只要为字符串就不会执行这一步
  */
  function setupRenderEffect(instance: Instance, container: Container) {
    // 收集依赖
    effect(() => {
      // 判断节点是否进行挂载，没有挂载就挂载否则进行diff
      if (!instance.isMounted) {
        console.log("init")
        const { proxy, vnode } = instance;
        // 生成渲染树,所以render不能使用箭头函数
        // 在第一次创建subTree时进行缓存，方便在更新时获取到旧的subTree
        const subTree: VNode = (instance.subTree = instance.render && instance.render.call(proxy));
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance);
        // 挂载DOM元素
        vnode.el = subTree.el;
        // 改变挂载状态
        instance.isMounted = true;
      } else {
        console.log("update")
        const { proxy } = instance;
        const oldSubTree = instance.subTree ?? null;
        const newSubTree: VNode = instance.render && instance.render.call(proxy);
        patch(oldSubTree, newSubTree, container, instance);
        // // 挂载DOM元素
        // vnode.el = subTree.el;
      }
    })
  }
  // 利用闭包返回render函数
  return {
    createApp: createAppApi(render)
  }
}

