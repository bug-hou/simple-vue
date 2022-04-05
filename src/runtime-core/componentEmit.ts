import { camelize, capitalize } from "../shared/index";
import { Instance } from "./type/index.type";

export function emit(instance: Instance, eventName: string, ...payload) {
  const { props } = instance;
  // 拼接事件名=>将事件名转化为首字母大写，然后在前面添加on
  const handlerName = "on" + capitalize(camelize(eventName))
  // 从props中获取对应的方法
  const handler = props && props[handlerName];
  // 执行
  handler && handler(...payload);
}