import { trackEffects, triggerEffects, isTracking } from './effect'
import { hasChanged, isObject } from '../utils'
import { reactive } from './reactive'

class RefImpl {
  private _value: any
  public dep: any
  public __v_isRef = true
  constructor(value: any) {
    this._value = isObject(value) ? reactive(value) : value
    this.dep = new Set()
  }
  get value() {
    if (isTracking()) {
      trackEffects(this.dep)
    }
    return this._value
  }
  set value(newVal: any) {
    if (hasChanged(newVal, this._value)) {
      this._value = newVal
      triggerEffects(this.dep)
    }
  }
}

export function ref(target: any) {
  return new RefImpl(target)
}

export function isRef(target: any) {
  return !!target?.__v_isRef
}

export function unRef(target: any) {
  return isRef(target) ? target.value : target
}

export function proxyRefs(objectWithRefs: any) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}
