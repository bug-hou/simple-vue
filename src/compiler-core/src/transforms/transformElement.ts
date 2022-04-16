import { NodeTypes } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";
import { AST } from "../type/type";

export function transformElement(node: AST, context: any) {
  if (node.type == NodeTypes.ELEMENT) {
    context.helper(CREATE_ELEMENT_VNODE);
    // 处理tag
    const vnodeTag = node.tag;
    let vnodeProps;

    let vnodeChildren = node.children[0];

    const vnodeElement = {
      type: NodeTypes.ELEMENT,
      tag: vnodeTag,
      props: vnodeProps,
      children: vnodeChildren
    }

    node.codegenNode = vnodeElement as any;
  }
}