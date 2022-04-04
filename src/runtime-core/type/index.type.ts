export interface VNode {
  type: Component | string
  props?: any
  children?: VNode[] | string | VNode
  // [key: string]: any
}

export interface Instance {
  vnode: VNode
  type: Component | string
  render?: Function
  setupState?: any
  proxy?: any
}

export interface Component {
  setup?: Function
  render?: Function

  // [key: string]: any
}

export type Container = HTMLElement;