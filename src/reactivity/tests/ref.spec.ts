import { effect } from "../effect";
import { isRef, proxyRefs, ref, unRef } from "../ref";

describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1)
  })
  it("should be reactive", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    })
    a.value++;
    expect(dummy).toBe(2);
    expect(calls).toBe(2);
    expect(a.value).toBe(2);
    a.value = 2;
    expect(dummy).toBe(2);
    expect(calls).toBe(2);
  });
  it("should be dep reactive", () => {
    const a = ref({
      name: "bughou",
      age: {
        a: 1
      }
    });
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value.name;
    })
    expect(dummy).toBe("bughou");
    expect(calls).toBe(1);
    a.value.name = "bughou12";
    expect(calls).toBe(2);
    expect(dummy).toBe("bughou12");
    a.value.age.a++;
    expect(calls).toBe(2);
    expect(dummy).toBe("bughou12");
    expect(a.value.age.a).toBe(2);
  });
  it("isRef", () => {
    const a = ref(1);
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
  });
  it("unRef", () => {
    const a = ref(1);
    expect(a).not.toBe(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })
  it("proxyRefs", () => {
    const a = {
      name: "bughou",
      age: ref(20)
    };
    expect(a.name).toBe("bughou")
    expect(a.age).not.toBe(20)
    expect(a.age.value).toBe(20)
    const b = proxyRefs(a)
    expect(b.age).toBe(20)
    b.age = 30;
    b.age = ref("Li Yang");
    expect(b.age).toBe("Li Yang");
  })
})