import { shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it("happy path", () => {
    const target = shallowReadonly({ n: { info: 1 } });
    // target.n = "jflskdfh";
    expect(target.n).not.toBe("jflskdfh");
    target.n.info = 10;
    expect(target.n.info).toBe(10)
  })
})