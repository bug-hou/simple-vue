import { h, getCurrentInstance } from "../../lib/simple-vue.esm.js";
import { foo } from "./foo.js"

console.log("fdjskldfhh" + getCurrentInstance())
window.self = null;

export const app = {
  render() {
    return h("div", { class: "app", ["data-index"]: 100 }, [
      h("p", {}, "我是p标签"),
      h("p", {
        onClick() {
          console.log("我是p标签")
        }
      }, "我是p标签"),
      h("p", {}, this.message),
      h(foo, { counter: 100 }, {
        header: h("p", {}, "header"),
        default: (props) => h("p", {}, props.count + "作用域插槽")
      })
    ])
  },
  setup() {
    const instance = getCurrentInstance();
    console.log("App:", instance)
    return {
      message: "bhgou 哈哈哈"
    }
  }
}