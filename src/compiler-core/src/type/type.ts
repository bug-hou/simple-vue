import { NodeTypes } from "../ast"

export interface Context {
  source: string,
  children?: any[]
}

export interface ElementType {
  type: NodeTypes
  tag: string
  children?: any[]
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
