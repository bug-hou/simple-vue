export interface CreateElement {
  (type: string): HTMLElement
}

export interface Insert {
  (el: HTMLElement, container: HTMLElement,anchor?:HTMLElement): void
}

export interface Remove {
  (el: HTMLElement): void
}

export interface PatchProp {
  (el: HTMLElement, key, preValue, nextValue): void
}

export interface SetElementText {
  (el: HTMLElement, text: any): void
}

export interface RenderOptions {
  createElement: CreateElement
  insert: Insert
  patchProp: PatchProp
  remove: Remove
  setElementText: SetElementText
}