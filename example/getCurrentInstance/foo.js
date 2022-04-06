import { h, renderSlots, getCurrentInstance } from "../../lib/simple-vue.esm.js"

export const foo = {
  name: "foo",
  setup(props, { emit }) {
    const instance = getCurrentInstance();
    console.log("Foo:", instance);
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
        renderSlots(this.$slots, "default", { count: 18 }),
        renderSlots(this.$slots, "header")
      ])
  }
}