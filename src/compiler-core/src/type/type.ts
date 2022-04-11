import { NodeTypes } from "../ast"

export interface Context {
  source: string
}

export interface ElementType {
  type: NodeTypes
  tag: string
}

export interface InterpolationType {
  type: NodeTypes
  content: {
    type: NodeTypes,
    content: string
  }
}

export interface TextType {
  type: NodeTypes
  content: string
}
