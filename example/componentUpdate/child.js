import { h, ref, reactive } from "../../lib/simple-vue.esm.js";
export default {
  name: "Child",
  setup(props, { emit }) { },
  render() {
    return h("div", {}, [h("div", {}, "child" + this.$props.msg)]);
  },
};
