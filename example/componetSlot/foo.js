import { h, renderSlots } from "../../lib/simple-vue.esm.js"

export const foo = {
  name: "foo",
  setup(props, { emit }) {
    console.log("foo:", props);
    try {
      props.counter++;
    } catch (error) {
      console.log(error)
    }
    return {
      clickHandle() {
        emit("add-foo", "侯向毅", "最帅")
      }
    }
  },
  render() {
    console.log(this.$slots)
    return h("div", { onClick: this.clickHandle },
      [
        h("p", {}, "foo:" + this.counter),
        renderSlots(this.$slots, "default"),
        renderSlots(this.$slots, "header", { age: 18 })
      ])
  }
}