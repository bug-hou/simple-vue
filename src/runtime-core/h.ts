import { Component, Type } from "./type/index.type";
import { createVNode } from "./vnode";

export function h(type: Type, props?, children?) {
  return createVNode(type, props, children)
}