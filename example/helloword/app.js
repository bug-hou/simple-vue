import { h } from "../../lib/simple-vue.esm.js";
import { foo } from "./foo.js"

window.self = null;

export const app = {
  render() {
    window.self = this;
    return h("div", { class: "app", ["data-index"]: 100 }, [
      h("p", {}, "我是p标签"),
      h("p", {
        onClick() {
          console.log("我是p标签")
        }
      }, "我是p标签"),
      h("p", {}, this.message),
      h(foo, { counter: 100 })
    ])
  },
  setup() {
    return {
      message: "bhgou 哈哈哈"
    }
  }
}