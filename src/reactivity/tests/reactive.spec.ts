import { isProxy, isReactive, isReadonly, reactive, readonly } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    const origin = { foo: 1 };
    const observed = reactive(origin);

    expect(observed).not.toBe(origin);

    expect(observed.foo).toBe(1);
  });
  it("is rective", () => {
    const target = reactive({
      name: "bughou"
    });
    expect(isReactive(target)).toBe(true);
    expect(isReactive({ name: "bughou" })).toBe(false)
    expect(isProxy(target)).toBe(true)
  });
  it("nest dep obejct", () => {
    const target = reactive({
      name: "bughou",
      age: 18,
      user: {
        name: "侯向毅",
        age: 20
      },
      likey: ["Li Yang", "bughou"]
    })
    const origin = readonly({
      name: "bughou",
      info: {
        age: 18
      }
    })
    expect(isReactive(target.user)).toBe(true);
    expect(isReactive(target.likey)).toBe(true);
    expect(isReadonly(origin.info)).toBe(true);
    expect(isReactive(origin.info)).toBe(false)
  });
  it("depReactive", () => {
    const target = reactive({
      name: "bughou",
      age: 18,
      user: {
        name: "侯向毅",
        age: 20
      },
      likey: ["Li Yang", "bughou"]
    })
    target.info = target;
    expect(isReactive(target.info)).toBe(true)
    target.info.age = 20;
    expect(target.age).toBe(20)
  });
  it("loop reactive", () => {
    const target = reactive({
      name: "bughou",
      age: 18,
      user: {
        name: "侯向毅",
        age: 20
      },
      likey: ["Li Yang", "bughou"]
    })
    const origin = readonly(target);
    expect(isReactive(origin)).toBe(false);
    expect(isReadonly(origin)).toBe(true)
  })
});
