export const enum ShapeFlags {
  ELEMENT = 1,//1
  STATEFUL_COMPONENT = 1 << 1,//10
  TEXT_CHILDREN = 1 << 2,//100
  ARRAY_CHILDREN = 1 << 3,//1000
  SLOT_CHILDREN = 1 << 4,//10000
}

/* 
通过位运算来确定类型
0001:字符串类型，直接转化为字符串
0010:为component组件类型，要通过processComponent函数生成对应的实例对象
0100:文本为字符串类型，直接赋值
1000:文本为数组类型要循环进行patch
0101:字符串类型的元素，和字符串类型的文本
····
*/

export function getShapeFlages(type) {
  return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}