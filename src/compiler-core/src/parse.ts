import { NodeTypes, TagType } from "./ast";
import { AST, Context, ElementType, InterpolationType, TextType } from "./type/type";

export function baseParse(content: string): AST {
  const context = createParseContext(content);

  return createRoot(parseChildren(context))
}

/* 
解析根对象
*/
function createRoot(children: any[]): AST {
  return {
    type: NodeTypes.ROOT,
    children
  }
}


/* 
解析上下文
*/
function createParseContext(context: string): Context {
  return {
    source: context
  }
}

/* 
解析children
*/
function parseChildren(context: Context, tag?: string) {
  const nodes: any[] = [];
  while (isEnd(context, tag)) {
    let node;
    const s = context.source;
    if (s.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (s.startsWith("<")) {
      // 检测标签:<d
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context);
      }
    }

    if (!node) {
      node = parseText(context)
    }
    nodes.push(node)
  }
  return nodes;
}

function isEnd(context: Context, tag?: string) {
  const s = context.source;
  if (tag && s.startsWith(`</`)) {
    if (s.startsWith(`</${tag}`)) {
      return false;
    } else {
      // 防止<div><span></div>,语法错误
      throw new SyntaxError("缺少结束标签" + tag)
    }
  }
  return !(s.length === 0)
}

// 解析mustache函数
function parseInterpolation(context: Context): InterpolationType {
  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  // {{message}}
  /* 
    先获取到}}对应的下标，在获取到message值
  */
  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
  // 将字符串向前推进2个单位
  context.source = advanceBy(context.source, openDelimiter.length);

  const rawContentLength = closeIndex - openDelimiter.length;

  const rawContent = parseTextDate(context.source, rawContentLength)
  // 去掉空格
  const content = rawContent.trim();

  // 在把字符串先前推进
  context.source = advanceBy(context.source, closeIndex)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

// 推进字符串
function advanceBy(content: string, len: number) {
  return content.slice(len)
}

function parseElement(context: Context): ElementType {
  const element = paserTag(context, TagType.START);
  element.children = parseChildren(context, element.tag);
  paserTag(context, TagType.END);
  return element;
}

function paserTag(context: Context, type: any): ElementType | undefined {
  const match = /^<\/?([a-z]{1,})/i.exec(context.source);
  let tag: string;
  if (match) {
    tag = match[1];
    context.source = advanceBy(context.source, match[0].length + 1)
  }
  if (type === TagType.END) {
    return;
  }
  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function parseText(context: Context): TextType {
  let endIndex = context.source.length;
  let endTokens = ["{{", "<"];

  endTokens.forEach(item => {
    let index = context.source.indexOf(item);
    if (index !== -1) {
      endIndex = endIndex > index ? index : endIndex;
    }
  })

  const s = parseTextDate(context.source, endIndex);
  context.source = advanceBy(context.source, s.length)
  return {
    type: NodeTypes.TEXT,
    content: s
  }
}

function parseTextDate(content: string, length: number) {
  return content.slice(0, length)
}

