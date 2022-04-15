import { NodeTypes } from "../ast";
import { AST } from "../type/type";

export function transformExpression(node: AST) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content);
  }
}

function processExpression(node: any) {
  node.content = `_ctx.${node.content}`;
  return node;
}