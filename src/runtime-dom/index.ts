import { createElement } from "./createElment"
import { insert } from "./insert"
import { patchProp } from "./patchProp"

import { createRenderer } from "../runtime-core/renderer"
import { Component } from "../runtime-core/type/index.type"

const renderer = createRenderer({ createElement, patchProp, insert })

export function createApp(rootContainer: Component) {
  return renderer.createApp(rootContainer);
}