export function remove(el: HTMLElement) {
  const parent = el.parentNode;
  parent?.removeChild(el)
}