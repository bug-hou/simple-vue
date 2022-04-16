export const extend = Object.assign;

export const hasChange = Object.is;

export const hasOwn = Reflect.has

export const isObject = (value) => value !== null && typeof value === "object"

export const isString = (value): value is string => typeof value === "string"

export const capitalize = (str: string) => str.slice(0, 1).toUpperCase() + str.slice(1)

export const camelize = (str: string) => str.replace(/-(\w)/g, (_, s: string) => s.toUpperCase())

export const isArray = Array.isArray

export const EMPTY_OBJ = {};