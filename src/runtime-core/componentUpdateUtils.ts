import { VNode } from "./type/index.type"

export function shouldUpdateComponent(preVNode: VNode, nextVNode: VNode) {
  const { props: prevProps } = preVNode
  const { props: nextProps } = nextVNode
  for (const key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}