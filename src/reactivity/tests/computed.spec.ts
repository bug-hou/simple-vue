import { computed } from "../computed";
import { reactive } from "../reactive"

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1
    })
    // const age = computed(() => user.age);
    const getter = jest.fn(() => user.age);
    const cValue = computed(getter)
    expect(getter).not.toHaveBeenCalled()
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);
    user.age = 2;
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);
  })
})