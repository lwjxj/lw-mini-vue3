import { describe, expect } from '@jest/globals'
import {
  readonly,
  isReadonly,
  reactive,
  isReactive,
  isProxy
} from '../reactive'

describe('readonly', () => {
  it('happy path', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)
    // 只读不可修改
    wrapped.foo = 2
    expect(wrapped.foo).toBe(1)

    // isReadonly
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(original)).toBe(false)
    expect(isProxy(wrapped)).toBe(true)
  })

  it('should call console.warn when set', () => {
    // ps: jest.fn() 用于创建一个 Mock 函数，可以设置该函数的返回值、监听该函数的调用、改变函数的内部实现等等。通过 jest.fn() 创建的函数有一个特殊的 .mock 属性，该属性保存了每一次调用情况
    console.warn = jest.fn()
    const user = readonly({ age: 10 })
    user.age = 11
    expect(console.warn).toBeCalled()
  })

  it('nested readonly', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(wrapped.bar)).toBe(true)
  })
})
