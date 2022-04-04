import { Component, VNode } from "./type/index.type";

export function createVNode(type: Component | string, props = {}, children?): VNode {
  const vnode = {
    type,
    props,
    children
  }
  return vnode
}