export const extend = Object.assign

export const hasChanged = (val: any, newVal: any) => {
  return !Object.is(val, newVal)
}

export const isObject = (val: any) => {
  return val !== null && typeof val === 'object'
}
