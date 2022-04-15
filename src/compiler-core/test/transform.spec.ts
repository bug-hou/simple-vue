import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";
import { AST } from "../src/type/type";

describe("transform", () => {
  it("happy path", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");
    const plugin = (node: AST) => {
      if (node.type === NodeTypes.TEXT) {
        node.content += "simple-vue";
      }
    }
    transform(ast, {
      nodeTransforms: [plugin]
    });
    const nodeText = ast.children[0].children[0].content
    expect(nodeText).toBe("hi,simple-vue")
  })
})