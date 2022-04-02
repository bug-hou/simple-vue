class ReactiveEffect {
  effectFn: Function;
  constructor(effectFn: Function) {
    this.effectFn = effectFn;
  }
  run() {
    activeFn = this;
    const result = this.effectFn();
    activeFn = null;
    return result;
  }
}

// 使用weakMap的原因为weakMap为弱引用，如果该变量销毁，会被GC回收
const targetMap = new WeakMap<object, Map<any, Set<ReactiveEffect>>>();

// 全局变量，记录当前运行的依赖函数
let activeFn: ReactiveEffect | null;

// // 创建/弹出收集依赖/触发的容器
// function createContain(target: Object, key: any) {

// }

export function effect(fn: Function) {
  // 对函数进行包装
  const effect = new ReactiveEffect(fn);

  // 执行函数收集依赖
  effect.run();

  return effect.run.bind(effect)
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
  }
}

export function trigger(target: object, key: any) {
  const depsMap = targetMap.get(target);
  const dep = depsMap?.get(key);
  dep?.forEach(effect => {
    effect.run();
  })
}
