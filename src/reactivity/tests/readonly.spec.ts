import { isProxy, isReadonly, readonly } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    const target = { name: "bughou", age: 18 };
    const targetReadonly = readonly(target);
    expect(targetReadonly).not.toBe(target);
    // targetReadonly.age++;
    expect(targetReadonly.age).toBe(18)
  });
  it("is readonly", () => {
    const target = readonly({
      name: "bughou"
    });
    expect(isReadonly(target)).toBe(true);
    expect(isReadonly({ name: "bughou" })).toBe(false)
    expect(isProxy(target)).toBe(true)
  })
})