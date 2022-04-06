// import { render } from "./renderer";
import { Container, Component } from "./type/index.type";
import { createVNode } from "./vnode";

export function createAppApi(render) {
  return function createApp(rootComponent: Component) {
    return {
      mount(rooContainer: Container | string) {
        // 将组件转化为vnode对象
        const vnode = createVNode(rootComponent);
        // 然后在基于虚拟节点进行操作
        render(vnode, parseContain(rooContainer), null);
      }
    }
  }
}

function parseContain(rooContainer: Container | string) {
  if (typeof rooContainer === "string") {
    return document.querySelector(rooContainer) as Container
  } else {
    return rooContainer;
  }
}
