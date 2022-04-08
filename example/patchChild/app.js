import { h } from "../../lib/simple-vue.esm.js";
import arrayTotext from "./arrayTotext.js";
import textToText from "./textToText.js";
import arrayToArray from "./arrayToArray.js";
import textToArray from "./textToArray.js";

export const app = {
  render() {
    return h("div", { tId: 1 }, [
      h("p", {}, "主页"),
      // h(arrayTotext),
      // h(textToText),
      h(arrayToArray),
      // h(textToArray)
    ])
  },
}