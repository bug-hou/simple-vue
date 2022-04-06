import { h } from "../../lib/simple-vue.esm.js";


export const app = {
  render() {
    const { x, y } = this;
    return h("rect", { x: x, y: y })
  },
  setup() {
    return {
      x: 100,
      y: 100
    }
  }
}