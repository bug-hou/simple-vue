import { h, ref, proxyRefs } from "../../lib/simple-vue.esm.js";

export const app = {
  render() {
    return h("div", {}, [
      h("p", { ...this.props, onClick: this.changePorps }, "当前计数:" + this.count),
      h("button", { onClick: this.addCount }, "增加"),
      h("button", { onClick: this.reduceCount }, "减少"),
    ])
  },
  setup() {
    const count = ref(1);
    const props = ref({
      foo: "foo",
      bar: "bar"
    })
    return {
      count,
      props,
      addCount() {
        count.value++;
      },
      reduceCount() {
        count.value--;
      },
      changePorps() {
        props.value.foo = "new-Foo";
        props.value.bar = undefined;
      }
    }
  }
}

