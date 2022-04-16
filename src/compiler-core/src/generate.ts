import { NodeTypes } from "./ast";
import { CREATE_ELEMENT_VNODE, helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";
import { transformExpression } from "./transforms/transformExpression";
import { AST } from "./type/type";
import { isString } from "../../shared"

/* 
将ast转化为render函数
*/
export function generate(ast: AST) {

  const functionName = "render";
  const args = ["_ctx", "_cache", "$props", "$setup", "$data", "$options"];
  const signature = args.join(",");
  const context = createCodegenContext()
  let { push } = context;
  if (ast.helpers.length > 0) {
    genFunctionPreamble(ast, context);
  }

  push("return ")

  push(`function ${functionName}(${signature}){`)

  push("return ");

  genNode(ast.codegenNode, context);

  push("}")
  return {
    code: context.code
  }
}

function genNode(node: AST, context: any) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genSimpleExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
  }
}


function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper: helperMapName
  }
  return context;
}

function genFunctionPreamble(ast: AST, context) {
  const { push } = context;
  const VueBinging = "vue"
  const aliasHelper = s => `${helperMapName[s]} as _${helperMapName[s]}`
  push(`import { ${ast.helpers.map(aliasHelper).join(", ")} } from ${VueBinging}\r\n`)
}
function genText(node: AST, context) {
  const { push } = context;
  push(`'${node.content}'`)
}

function genInterpolation(node: AST, context: any) {
  const { push, helper } = context;
  push(`${helper[TO_DISPLAY_STRING]}(`)
  transformExpression(node)
  genNode(node.content as any, context);
  push(`)`)
}

function genSimpleExpression(node: AST, context: any) {
  const { push } = context;
  push(`${node.content}`)
}

function genElement(node: AST, context) {
  const { push, helper } = context;
  const { tag, children } = node;
  push(`${helper[CREATE_ELEMENT_VNODE]}("${tag}"),null,`)
  genNode(children as any, context);
  push(")")
  // if (children) {
  //   children.forEach(item => {
  //     genNode(item, context);
  //   })
  // }
}

function genCompoundExpression(node: AST, context) {
  const { push } = context;
  const children = node.children;
  if (children) {
    children.forEach(child => {
      if (isString(child)) {
        push(child)
      } else {
        genNode(child, context);
      }
    })
  }
}

