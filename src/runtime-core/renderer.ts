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
      // patch对比
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
      // 进行多少次patch(节点对比)
      let patched: number = 0;
      // 最多可以进行节点对比的次数(新节点的个数)
      const toBePatched = newR - l + 1;
      /* 
        if(patched > toBepatched){
          就可以直接删除旧节点中的剩余元素
        }
      */
      const keyToNewIndexMap = new Map();
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      // 判断新旧节点是否出现偏移
      let moved = false;
      let maxNewIndexSofar = 0;
      // 将新的vnode虚拟节点保存到map对象中
      for (let i = l; i <= newR; i++) {
        const preNode = c2[i];
        if (preNode.key) {
          keyToNewIndexMap.set(preNode.key, i)
        }
      }
      for (let i = l; i <= oldR; i++) {
        const oldNode = c1[i];
        // 当map中所有的值都在old节点中找到对应的值时，就可以删除old节点中其他的节点
        if (patched >= toBePatched) {
          remove(oldNode.el as HTMLElement);
          continue;
        }
        let indexKey: number | undefined;
        // 存在key时，有key时的查找O(1)
        if (oldNode.key) {
          if (keyToNewIndexMap.has(oldNode.key)) {
            // 在old节点中有new节点的值，可以执行patch，比较新旧节点的区别
            indexKey = keyToNewIndexMap.get(oldNode.key)
          }
        } else {
          // 不存在key时，只能通过for循环遍历
          for (let j = l; j <= newR; i++) {
            if (isSameVNodeType(oldNode, c2[j])) {
              indexKey = j;
              break;
            }
          }
        }
        if (!indexKey) {
          // 如果没有相同的值，删除旧节点
          remove(oldNode.el as HTMLElement);
        } else {
          if (indexKey >= maxNewIndexSofar) {
            maxNewIndexSofar = indexKey;
          } else {
            moved = true;
          }
          newIndexToOldIndexMap[indexKey - l] = i + 1;
          patch(oldNode, c2[indexKey], container, parentInstance);
          patched++;
        }
      }
      /* 
        获取到最长子序列
        [A,B,C,D,F]
        [D,A,B,C]
        最长子序列
        [A,B,C]
      */
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
      let j = increasingNewIndexSequence.length - 1;
      debugger;

      /* 
        如果从头开始遍历的话，后面的元素可能不存在在老节点中，程序就有bug，所有从后面开始遍历，确保可以插入成功
      */
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = l + i;
        const nextVNode = c2[nextIndex];
        const anchor = c2[nextIndex + 1].el ?? undefined;
        if (newIndexToOldIndexMap)
          if (newIndexToOldIndexMap[i] === 0) {
            patch(null, nextVNode, container, parentInstance, anchor)
          }
        if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[i]) {
            console.log("要进行调换");
            insert(nextVNode.el as HTMLElement, container, anchor)
          } else {
            j--;
          }
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
    if (!n1) {
      // 实例化组件
      mountComponent(n2, container, parentInstance)
    } else {
      updateComponent(n1, n2, container, parentInstance);
    }
  }

  function updateComponent(n1: VNode | null, n2: VNode, container: Container, parentInstance: Instance | null) {
    n1
  }

  function mountComponent(vnode: VNode, container: Container, parentInstance: Instance | null) {
    // 创建一个组件实例
    const instance = (vnode.component = createComponentInstance(vnode, parentInstance));
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
    instance.update = effect(() => {
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

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}

