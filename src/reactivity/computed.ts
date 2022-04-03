import { ReactiveEffect } from "./effect";

class computedRefImpl {
  // private _getter: any;
  private _dirty: boolean = true;
  private _cache: any;
  private _effect: ReactiveEffect;
  constructor(getter: any) {
    // this._getter = getter;

    // 对getter执行函数添加负影响，当getter中的值方式改变时触发
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    // 要获取到什么时候修改，就将_dirty锁打开
    if (this._dirty) {
      this._dirty = false;
      this._cache = this._effect.run();
    }
    return this._cache;
  }
}

export function computed(getter) {
  return new computedRefImpl(getter);
}