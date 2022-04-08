export function insert(el: HTMLElement, parent: HTMLElement, anchor?: HTMLElement) {
  if (anchor) {
    parent.insertBefore(el, anchor)
    return;
  }
  parent.appendChild(el)
}