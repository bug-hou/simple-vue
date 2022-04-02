import { extend } from "../shared";

class ReactiveEffect {
  effectFn: Function;
  scheduler?: Function;
  onStop?: Function;
  deps: Set<ReactiveEffect>[] = new Array();
  active = true
  constructor(effectFn: Function) {
    // this.scheduler = scheduler;
    // this.onStop = onStop;
    this.effectFn = effectFn;
  }
  run() {
    activeFn = this;
    const result = this.effectFn();
    activeFn = null;
    return result;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.onStop ? this.onStop() : null;
      this.active = false;
    }
  }
}


// 使用weakMap的原因为weakMap为弱引用，如果该变量销毁，会被GC回收
const targetMap = new WeakMap<object, Map<any, Set<ReactiveEffect>>>();

// 全局变量，记录当前运行的依赖函数
let activeFn: ReactiveEffect | null;

// 删除依赖
function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach(dep => {
    dep.delete(effect);
  })
}


export function effect(fn: Function, options = {} as any) {
  // 对函数进行包装
  const effect = new ReactiveEffect(fn);
  extend(effect, options)

  // 执行函数收集依赖
  effect.run();

  // 返回函数
  const runner: any = effect.run.bind(effect);
  // 将effect对象添加到runner函数对象中
  runner.effect = effect;
  // 返回runner
  return runner;
}

export function track(target: object, key: any) {
  // 要对每一个target => key => 创建一个dep类
  let depsMap = targetMap.get(target);
  // 初始化处理
  if (!depsMap) {
    depsMap = new Map();
    // 添加到map对象中
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  if (activeFn) {
    dep.add(activeFn);
    activeFn.deps.push(dep)
  }
}

export function trigger(target: object, key: any) {
  const depsMap = targetMap.get(target);
  const dep = depsMap?.get(key);
  // 会更新所有收集的依赖
  dep?.forEach(effect => {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  })
}

export function stop(runner: any) {
  runner.effect.stop();
}
