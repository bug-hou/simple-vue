export interface CreateElement {
  (type: string): HTMLElement
}

export interface Insert {
  (el: HTMLElement, container: HTMLElement): void
}

export interface PatchProp {
  (el: HTMLElement, key, value): void
}

export interface RenderOptions {
  createElement: CreateElement
  insert: Insert
  patchProp: PatchProp
}