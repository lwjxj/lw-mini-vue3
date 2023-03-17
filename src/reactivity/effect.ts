import { extend } from '../utils'

let activeEffect: any
let shouldTrack = false // 是否应该收集依赖
const effectStack: any = []

export class ReactiveEffect {
  private _fn: any
  deps: Array<any> = []
  active = true
  onStop?: () => void
  constructor(fn: Function, public scheduler: any) {
    this._fn = fn
  }

  run() {
    // 已经被stop，直接返回结果
    if (!this.active) {
      return this._fn()
    }

    if (!effectStack.includes(this)) {
      cleanupEffect(this)
      let lastShouldTrack = shouldTrack
      try {
        // 此时应该被收集依赖，可以给activeEffect赋值，去运行原始依赖
        shouldTrack = true
        // 入栈
        effectStack.push(this)
        activeEffect = this
        return this._fn()
      } finally {
        // 出栈
        effectStack.pop()
        // 由于运行原始依赖的时候，会触发代理对象的get操作，会重复进行依赖收集，所以调用完以后就关上开关，不允许再次收集依赖
        shouldTrack = lastShouldTrack
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

export function effect(fn: Function, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

const targetMap = new WeakMap()

export function track(target: Object, key: string | symbol) {
  // * target -> key -> dep
  // 其中WeakMap的键是原始对象target，值是一个Map实例；WeakMap: target -> Map
  // 而Map的键是原始对象target的key，值是一个由副作用函数组成的Set。Map: key -> Set
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  // * dep
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!activeEffect) return
  dep.add(activeEffect)
  activeEffect?.deps.push(dep)
}

export function trigger(target: Object, key: string | symbol) {
  let depsMap = targetMap.get(target)
  if (!depsMap) return
  let dep = depsMap.get(key)
  if (!dep) return
  for (const effect of dep) {
    // 判断是否有scheduler，有则执行，无则执行fn
    if (effect.sheduler) {
      effect.scheduler(effect._fn)
    } else {
      effect.run()
    }
  }
}

export function stop(runner: any) {
  runner.effect.stop()
}

function cleanupEffect(effect: any) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
}

// 抽离dep的收集逻辑
export function trackEffects(dep: any) {
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

// 抽离dep的触发逻辑
export function triggerEffects(dep: any) {
  // 重新构建一个新的Set
  const effects = new Set<any>()

  // 如果trigger触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
  dep &&
    dep.forEach((effect: any) => {
      if (effect !== activeEffect) {
        effects.add(effect)
      }
    })

  for (const effect of effects) {
    if (effect.scheduler) {
      // ps: effect._fn 为了让scheduler能拿到原始依赖
      effect.scheduler(effect._fn)
    } else {
      effect.run()
    }
  }
}

export function isTracking() {
  return shouldTrack && activeEffect
}
