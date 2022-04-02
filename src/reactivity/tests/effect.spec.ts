import { effect } from "../effect";
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
  })
});
