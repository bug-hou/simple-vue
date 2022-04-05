import { h } from "../h";

export function renderSlots(slots, name: string = "default", props = {}) {
  const slot = slots[name]
  if (slot) {
    if (typeof slot === "function") {
      return h("div", {}, slot(props))
    }
    return h("div", {}, slot)
  }
  return "";
}