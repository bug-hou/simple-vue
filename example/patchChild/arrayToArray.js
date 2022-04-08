import { h, ref } from "../../lib/simple-vue.esm.js";

// const nextChildren = [h("div", {}, "newA"), h("div", {}, "newB")];
// const prevChildren = [h("div", {}, "A"), h("div", {}, "B")]

const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "G" }, "G"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "C" }, "C"),
];

const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "E" }, "E123"),
  // h("p", { key: "D" }, "D"),
  // h("p", { key: "F" }, "F"),
  // h("p", { key: "G" }, "G"),
  h("p", { key: "C" }, "C"),
];

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