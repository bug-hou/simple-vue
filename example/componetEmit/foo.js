import { h } from "../../lib/simple-vue.esm.js"

export const foo = {
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
    return h("div", { onClick: this.clickHandle }, "foo:" + this.counter + this.name)
  }
}