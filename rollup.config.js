const { nodeResolve } = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const { babel } = require("@rollup/plugin-babel");
const pkg = require("./package.json")

module.exports = {
  input: "./src/index.ts",
  output: [
    {
      format: "cjs",
      file: pkg.main,
    },
    {
      format: "es",
      file: pkg.module
    }
  ],
  plugins: [
    nodeResolve(),
    typescript(),
    babel()
  ]
}