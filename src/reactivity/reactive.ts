import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers
} from './baseHandlers'
import { isObject } from '../utils'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw'
}

export const reactiveMap = new WeakMap()
export const readonlyMap = new WeakMap()
export const shallowReadonlyMap = new WeakMap()

function createReactiveObject(
  target: any,
  baseHandlers: Object,
  proxyMap: any
) {
  // 不是对象，警告，返回原数据
  if (!isObject(target)) {
    console.log(`value cannot be made reactive: ${String(target)}`)
    return target
  }
  if (target[ReactiveFlags.RAW]) {
    return target
  }
  const existingProxy = proxyMap.get(target)
  // 这里解决的是reactive多层嵌套的问题
  if (existingProxy) {
    return existingProxy
  }
  const proxy = new Proxy(target, baseHandlers)
  // 缓存已经被代理的对象
  proxyMap.set(target, proxy)
  return proxy
}

export function reactive(target: any) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

export function readonly(target: any) {
  return createReactiveObject(target, readonlyHandlers, readonlyMap)
}

export function isReactive(target: any) {
  // return target['is_reactive'] ?? false
  // return !!target['is_reactive']
  return !!target[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(target: any) {
  return !!target[ReactiveFlags.IS_READONLY]
}

export function shallowReadonly(target: any) {
  return createReactiveObject(
    target,
    shallowReadonlyHandlers,
    shallowReadonlyMap
  )
}

export function isProxy(target: any) {
  return isReactive(target) || isReadonly(target)
}
