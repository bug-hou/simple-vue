import { baseParse } from "../src/parse"
import { generate } from "../src/generate"
import { transform } from "../src/transform";
import { transformElement } from "../src/transforms/transformElement";
import { transformText } from "../src/transforms/transformText";

describe("codegen", () => {
  it('string', () => {
    const ast = baseParse("hi");

    transform(ast)

    const { code } = generate(ast);

    expect(code).toMatchSnapshot()
  })
  it('interpolation', () => {
    const ast = baseParse("{{message}}");

    transform(ast)

    const { code } = generate(ast);

    expect(code).toMatchSnapshot()
  })
  it('element', () => {
    const ast = baseParse("<div>hi,{{message}}</div>");

    transform(ast, {
      nodeTransforms: [transformText, transformElement]
    })

    const { code } = generate(ast);

    expect(code).toMatchSnapshot()
  })
})

