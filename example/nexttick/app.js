import { h, ref, reactive } from "../../lib/simple-vue.esm.js";
import NextTicker from "./nexttick.js";

export default {
  name: "App",
  setup() { },

  render() {
    return h("div", { tId: 1 }, [h("p", {}, "主页"), h(NextTicker)]);
  },
};