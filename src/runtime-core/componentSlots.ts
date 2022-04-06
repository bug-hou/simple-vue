import { isArray } from "../shared/index";
import { ShapeFlags } from "../shared/shapeFlags";
import { Instance, VNode } from "./type/index.type";

export function initSlots(instance: Instance, children: VNode[] | string | VNode) {
  const { shapeFlag } = instance.vnode;

  const slots = {};
  // children必定为一个对象时
  if ((shapeFlag & ShapeFlags.SLOT_CHILDREN) && !isArray(children)) {
    for (const key in children as object) {
      const value = children[key];
      if (typeof value === "function") {
        // 实现作用域插槽
        slots[key] = (props) => normalizeObjectSlotValue(value(props))
      } else {
        slots[key] = normalizeObjectSlotValue(value);
      }
    }
    instance.slots = slots;
  } else {
    // 当为一个数组时，默认为default插槽中的值
    instance.slots["default"] = normalizeObjectSlotValue(children);
  }
}

function normalizeObjectSlotValue(value) {
  return isArray(value) ? value : [value];
}