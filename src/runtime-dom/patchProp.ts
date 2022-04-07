export function patchProp(el: HTMLElement, key, preValue, nextValue) {
  /* 
    要判断处理的prop是否为一个事件函数
    onClick/onMousedown
  */
  const isOn = key => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    el.addEventListener(key.slice(2).toLowerCase(), nextValue);
  } else {
    if (nextValue === undefined || nextValue === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextValue);
    }
  }
}