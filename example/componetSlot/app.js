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
      h(foo, { counter: 100, onAddFoo: this.addHandler }, { default: h("p", {}, "我是slot"), header: ({ age }) => h("p", {}, "我的名字" + age) }),
      // h(foo, { counter: 100, onAddFoo: this.addHandler }, h("p", null, "jfdlkshfweiohg")),
      h(foo, { counter: 100, onAddFoo: this.addHandler }, [h("p", null, "我是默认插槽")])
    ])
  },
  setup() {
    return {
      message: "bhgou 哈哈哈",
      addHandler(name, str) {
        console.log("我是add通过emit发射的");
        console.log(name + str)
      }
    }
  }
}