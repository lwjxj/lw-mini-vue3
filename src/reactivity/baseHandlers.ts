/**
 * @description 存储用于代理处理函数
 */
import { track, trigger } from './effect'
import { ReactiveFlags, reactive, readonly } from './reactive'
import { extend } from '../utils'

function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Object, key: string | symbol) {
    const res = Reflect.get(target, key)

    // 如果读取的key是is_reactive，则返回true
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.RAW) {
      return target
    }

    // shallow
    if (shallow) {
      return res
    }

    if (typeof res === 'object') {
      return isReadonly ? readonly(res) : reactive(res)
    }

    if (!isReadonly) {
      track(target, key)
    }

    return res
  }
}

function createSetter() {
  return function set(target: Object, key: string | symbol, value: any) {
    const res = Reflect.set(target, key, value)

    trigger(target, key)
    return res
  }
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

// reactive
export const mutableHandlers = {
  get,
  set
}

// readonly
export const readonlyHandlers = {
  get: readonlyGet,
  set(target: Object, key: string | symbol, value: any) {
    console.warn(
      `key: ${
        key as string
      } set value: ${value} failed, because the target is readonly!`,
      target
    )
    return true
  }
}

// shallowReadonly
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet
})
