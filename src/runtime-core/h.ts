import { Component } from "./type/index.type";
import { createVNode } from "./vnode";

export function h(type: Component | string, props?, children?) {
  return createVNode(type, props, children)
}