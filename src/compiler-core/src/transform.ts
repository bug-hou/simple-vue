import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";
import { AST } from "./type/type";

export function transform(ast: AST, options?: any) {
  const context = createTransformContext(ast, options)
  // 遍历节点，使用深度优先算法
  traverseNode(ast, context)

  createRootCodegen(ast)

  ast.helpers = [...context.helpers.keys()]
}

function traverseNode(node: AST, context: any) {

  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node, context);
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      const children = node.children;
      if (children) {
        console.log(node.type || node)
        children.forEach(item => {
          traverseNode(item, context)
        })
      }
      break;
    default:
      break;
  }

}

function createTransformContext(ast: AST, options: any) {
  const context = {
    ast,
    nodeTransforms: options?.nodeTransforms || [],
    helpers: new Map(),
    helper(k) {
      context.helpers.set(k, 1);
    }
  }
  return context;
}
function createRootCodegen(ast: AST) {
  const child = ast.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    ast.codegenNode = child.codegenNode;
  } else {
    ast.codegenNode = ast.children[0]
  }
}

