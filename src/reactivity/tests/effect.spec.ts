import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
      name: "bughou",
    });
    let nextAge: any;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);

    user.age++;
    expect(nextAge).toBe(12);
  });
  it("depObj", () => {
    let dummy;
    let dummyName;
    let trace = 0;
    const origin = reactive({ info: { age: 20, name: "bughou" } });
    effect(() => {
      dummy = origin.info.age;
      trace++;
    })
    effect(() => {
      trace++;
      dummyName = origin.info.name;
    })
    expect(dummy).toBe(20);
    expect(dummyName).toBe("bughou");
    expect(trace).toBe(2)
    origin.info.age++;
    expect(dummy).toBe(20);
    expect(dummyName).toBe("bughou");
    expect(trace).toBe(2)
  });
  it("", () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "foo"
    })
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12)
    expect(r).toBe("foo")
  });
  it("scheduler", () => {
    /* 
    1. 通过effect的第二个参数给定后，一个scheduler的fn函数
    2. effect第一次还是会执行fn函数
    3. 当响应式的数据发生改变时，就不会执行fn，而是执行scheduler函数
    4. 如果说当执行runner是会在
    */
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    })
    const obj = reactive({
      foo: 1
    })
    const runner = effect(() => {
      dummy = obj.foo;
    }, { scheduler })
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // obj.foo更新时
    obj.foo++;
    // 是不会触发上面的值
    expect(scheduler).toHaveBeenCalled();
    // 执行scheduler函数
    expect(dummy).toBe(1);
    // run赋值给runner
    run();
    // 执行run方法
    expect(dummy).toBe(2)
  });
  it("stop", () => {
    let dummy;
    const obj = reactive({ age: 20 });
    const runner = effect(() => {
      dummy = obj.age;
    })
    obj.age++;
    expect(dummy).toBe(21);
    stop(runner);
    obj.age++;
    expect(dummy).toBe(21);
    runner();
    expect(dummy).toBe(22)
  });
  it("events: onStop", () => {
    const onStop = jest.fn();
    const runner = effect(() => { }, {
      onStop,
    });

    stop(runner);
    expect(onStop).toHaveBeenCalled();
  });
});
