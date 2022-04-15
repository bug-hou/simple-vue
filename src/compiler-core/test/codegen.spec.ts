import { baseParse } from "../src/parse"
import { generate } from "../src/generate"
import { transform } from "../src/transform";

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
})

