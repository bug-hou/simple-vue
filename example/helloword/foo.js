import { h } from "../../lib/simple-vue.esm.js"

export const foo = {
  setup(props) {
    console.log("foo:", props);
    try {
      props.counter++;
    } catch (error) {
      console.log(error)
    }
    return {
      clickHandle() {
        console.log("点击事件")
      }
    }
  },
  render() {
    return h("div", { onClick: this.clickHandle }, "foo:" + this.counter + this.name)
  }
}