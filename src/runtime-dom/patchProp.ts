export function patchProp(el: HTMLElement, key, value) {
  /* 
    要判断处理的prop是否为一个事件函数
    onClick/onMousedown
  */
  const isOn = key => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    el.addEventListener(key.slice(2).toLowerCase(), value);
  } else {
    el.setAttribute(key, value);
  }
}