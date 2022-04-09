import { isArray } from "../shared/index";
import { getShapeFlages, ShapeFlags } from "../shared/shapeFlags";
import { Type, VNode } from "./type/index.type";

// 处理文档碎片
export const Fragment = Symbol("Fragment")
// 处理文本类型
export const Text = Symbol("Fragment")

export function createVNode(type: Type, props: any = {}, children?): VNode {
  const vnode = {
    type,
    props,
    children,
    key: props.key,
    shapeFlag: getShapeFlages(type),
    component: null,
    el: null
  }
  /* 
    判断children的类型
  */
  //  element + 文本
  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    // element + 数组
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  // 组件 + children object
  if ((vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)) {
    if ((typeof children === "object") && (!isArray(children))) {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text)
}