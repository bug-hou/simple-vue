import { ShapeFlags } from "../../shared/shapeFlags"

/* 
type:表示类型
vnode:虚拟节点

*/
export type Type = Component | string | Symbol
export interface VNode {
  type: Type
  props?: any
  children?: VNode[] | string | VNode
  key?: string | null
  el?: HTMLElement | null
  shapeFlag: ShapeFlags
  component?: Instance | null
  // [key: string]: any
}

export interface Instance {
  vnode: VNode
  type: Component | string | Symbol
  props?: Props
  render?: Function
  setupState?: any
  provides?: any
  parent: Instance | null
  proxy?: any
  slots?: any
  subTree?: VNode
  isMounted?: boolean
  emit?: Function
  update?: Function
  next?: VNode | null
}

export interface Component {
  setup?: Function
  render?: Function

  // [key: string]: any
}

export interface Props {
  [key: string]: any | PropsValue
}

interface PropsValue {
  type?: number
  default?: any
  required?: boolean
}

export type Container = HTMLElement;
