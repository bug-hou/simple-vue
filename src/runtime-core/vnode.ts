import { isArray } from "../shared/index";
import { getShapeFlages, ShapeFlags } from "../shared/shapeFlags";
import { Component, VNode } from "./type/index.type";

export function createVNode(type: Component | string, props = {}, children?): VNode {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlages(type),
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
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if ((typeof children === "object") && (!isArray(children))) {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}