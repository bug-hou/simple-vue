import { h } from "../../lib/simple-vue.esm.js"

export const app = {
  render() {
    return h("div", { class: "app", ["data-index"]: 100 }, [
      h("p", {}, "我是p标签"),
      h("p", {}, "我是p标签"),
      h("p", {}, this.message),
    ])
  },
  setup() {
    return {
      message: "bhgou 哈哈哈"
    }
  }
}