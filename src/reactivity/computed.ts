import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  // private _getter: any
  // 增加是否需要缓存标识和缓存变量
  private _dirty: Boolean = true
  private _value: any
  private _effect: ReactiveEffect

  constructor(getter: any) {
    // this._getter = getter
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}

export const computed = (getter: any) => {
  return new ComputedRefImpl(getter)
}
