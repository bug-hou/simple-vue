import { h, ref } from "../../lib/simple-vue.esm.js";

const nextChildren = [h("div", {}, "A"), h("div", {}, "B")];
const prevChildren = "oldChildren"

export default {
  name: "lksdfjs",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;
    return {
      isChange
    }
  },
  render() {
    const self = this;
    // return h("div", {}, [h("div", {}, "A"), h("div", {}, "B")])
    return self.isChange === true ? h("div", {}, nextChildren) : h("div", {}, prevChildren)
  }
}