import { createElement } from "./createElment"
import { insert } from "./insert"
import { patchProp } from "./patchProp"
import { remove } from "./remove"
import { setElementText } from "./setElementText"

import { createRenderer } from "../runtime-core/renderer"
import { Component } from "../runtime-core/type/index.type"

const renderer = createRenderer({ createElement, patchProp, insert, remove, setElementText })

export function createApp(rootContainer: Component) {
  return renderer.createApp(rootContainer);
}