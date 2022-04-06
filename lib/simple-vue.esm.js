var hasOwn = Reflect.has;
var isObject = function (value) { return value !== null && typeof value === "object"; };
var capitalize = function (str) { return str.slice(0, 1).toUpperCase() + str.slice(1); };
var camelize = function (str) { return str.replace(/-(\w)/g, function (_, s) { return s.toUpperCase(); }); };
var isArray = Array.isArray;

/*
通过位运算来确定类型
0001:字符串类型，直接转化为字符串
0010:为component组件类型，要通过processComponent函数生成对应的实例对象
0100:文本为字符串类型，直接赋值
1000:文本为数组类型要循环进行patch
0101:字符串类型的元素，和字符串类型的文本
····
*/
function getShapeFlages(type) {
    return typeof type === "string" ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

// 处理文档碎片
var Fragment = Symbol("Fragment");
// 处理文本类型
var Text = Symbol("Fragment");
function createVNode(type, props, children) {
    if (props === void 0) { props = {}; }
    var vnode = {
        type: type,
        props: props,
        children: children,
        shapeFlag: getShapeFlages(type),
        el: null
    };
    /*
      判断children的类型
    */
    //  element + 文本
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        // element + 数组
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    // 组件 + children object
    if ((vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */)) {
        if ((typeof children === "object") && (!isArray(children))) {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

// 使用weakMap的原因为weakMap为弱引用，如果该变量销毁，会被GC回收
var targetMap = new WeakMap();
// export function trackEffects(dep: Set<any>) {
//   dep.add(activeFn);
//   activeFn?.deps.push(dep)
// }
function trigger(target, key) {
    var depsMap = targetMap.get(target);
    var dep = depsMap === null || depsMap === void 0 ? void 0 : depsMap.get(key);
    // 会更新所有收集的依赖
    dep === null || dep === void 0 ? void 0 : dep.forEach(function (effect) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    });
}

// 在一个createGetter/Setter函数中会产生闭包，所以可以使用缓存
var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var readonlySet = createSetter(true);
var shallowReadonlyGet = createGetter(true, true);
var shallowReadonlySet = readonlySet;
// 根据readonly是否为true来确定isReactive/isReadonly
function createGetter(isReadonly, shallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (shallow === void 0) { shallow = false; }
    return function get(target, key, receiver) {
        // 判断是否为reactive和readonly
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        var result = Reflect.get(target, key, receiver);
        // 不为浅监听就进行深度代理
        if (!shallow) {
            // 如果result为一个对象，就对该属性进行proxy代理
            if (isObject(result)) {
                if (isReadonly) {
                    return readonly(result);
                }
                return reactive(result);
            }
        }
        return result;
    };
}
function createSetter(isReadonly) {
    if (isReadonly === void 0) { isReadonly = false; }
    return function set(target, key, value, receiver) {
        if (isReadonly) {
            throw new SyntaxError("当前对象设置为只读不能修改");
        }
        var result = Reflect.set(target, key, value, receiver);
        // 触发依赖
        trigger(target, key);
        return result;
    };
}
var mutableHandlers = {
    get: get,
    set: set,
};
var readonlyHandlers = {
    get: readonlyGet,
    set: readonlySet,
};
var shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set: shallowReadonlySet
};

// 统一处理监听对象
function createActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}
function reactive(raw) {
    // 对原数据进行处理
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}

function emit(instance, eventName) {
    var payload = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        payload[_i - 2] = arguments[_i];
    }
    var props = instance.props;
    // 拼接事件名=>将事件名转化为首字母大写，然后在前面添加on
    var handlerName = "on" + capitalize(camelize(eventName));
    // 从props中获取对应的方法
    var handler = props && props[handlerName];
    // 执行
    handler && handler.apply(void 0, payload);
}

function initProps(instance, props) {
    instance.props = props;
}

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
    $slots: function (i) { return i.slots; }
};
var publicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var _b = instance, setupState = _b.setupState, props = _b.props;
        // 先使用setup函数返回值的属性
        /*
          变量权重setup > data > props
        */
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props || {}, key)) {
            return props && props[key];
        }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
        // return Reflect.get(target, key, receiver)
    }
};

function initSlots(instance, children) {
    var shapeFlag = instance.vnode.shapeFlag;
    var slots = {};
    // children必定为一个对象时
    if ((shapeFlag & 16 /* SLOT_CHILDREN */) && !isArray(children)) {
        var _loop_1 = function (key) {
            var value = children[key];
            if (typeof value === "function") {
                // 实现作用域插槽
                slots[key] = function (props) { return normalizeObjectSlotValue(value(props)); };
            }
            else {
                slots[key] = normalizeObjectSlotValue(value);
            }
        };
        for (var key in children) {
            _loop_1(key);
        }
        instance.slots = slots;
    }
    else {
        // 当为一个数组时，默认为default插槽中的值
        instance.slots["default"] = normalizeObjectSlotValue(children);
    }
}
function normalizeObjectSlotValue(value) {
    return isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    var _a;
    /*
    通过vnode生成component组件实例:instance
    */
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        slots: {},
        provides: (_a = parent === null || parent === void 0 ? void 0 : parent.provides) !== null && _a !== void 0 ? _a : {},
        // 避免每次原型链深度访问
        parent: parent,
        emit: function () { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    var _a;
    /*
    只有component节点才能进行到这里
    在component节点的vnode中自包含三个属性
    component,
    props,
    children:children主要处理slot插槽
    */
    // 先处理vnode中的props属性
    initProps(instance, instance.vnode.props);
    // 在处理vnode中的children属性
    initSlots(instance, (_a = instance.vnode.children) !== null && _a !== void 0 ? _a : "");
    // 初始化一个有状态的setup对象
    setupStatefulComponent(instance);
}
/*
执行setup函数
*/
function setupStatefulComponent(instance) {
    var Component = instance.type;
    /*
      在模板中使用this
    */
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    if (typeof Component !== "string") {
        var setup = Component.setup;
        if (setup) {
            // 执行setup函数
            /*
              确保props属性只读
            */
            //  在setup执行之前赋值
            setCurrentInstance(instance);
            var setupResult = setup.call(null, shallowReadonly(instance.props), { emit: instance.emit });
            // setup执行完毕后删除
            setCurrentInstance(null);
            handleSetupResult(instance, setupResult);
        }
    }
}
function handleSetupResult(instance, setupResult) {
    /*
      执行了setup获取到返回值，判断返回的类型:function|object
      */
    if (typeof setupResult === "function") {
        instance.setupState = setupResult();
    }
    else {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
// 将组件中的render函数赋值到实例中
function finishComponentSetup(instance) {
    if (typeof instance.type !== "string") {
        var Component = instance.type;
        instance.render = Component === null || Component === void 0 ? void 0 : Component.render;
    }
}
// 通过getCurrentInstance获取的instance实例
var currentInstance;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    if (instance === void 0) { instance = null; }
    currentInstance = instance;
}

/*
所以provide只能在setup中使用
*/
function provide(key, value) {
    var _a, _b;
    var instance = getCurrentInstance();
    if (instance) {
        // 将属性添加到provides对象中
        var parent_1 = instance.parent;
        /*
          创建provides的原型链
        */
        if (instance.provides === ((_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provides)) {
            instance.provides = Object.create((_b = parent_1 === null || parent_1 === void 0 ? void 0 : parent_1.provides) !== null && _b !== void 0 ? _b : null);
        }
        instance.provides[key] = value;
    }
}

function inject(key, defaultValue) {
    var _a;
    var instance = getCurrentInstance();
    if (instance) {
        var parent_1 = instance.parent;
        // 从下到上依次访问获取，如果到root没有就使用默认值
        /*
        while (true) {
          if (parent) {
            const value = parent.provides[key]
            if (value) {
              return value
            } else {
              parent = parent.parent;
            }
          } else {
            return defaultValue;
          }
        }
        */
        return (_a = parent_1 === null || parent_1 === void 0 ? void 0 : parent_1.provides[key]) !== null && _a !== void 0 ? _a : defaultValue;
    }
}

function renderSlots(slots, name, props) {
    if (name === void 0) { name = "default"; }
    if (props === void 0) { props = {}; }
    var slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return h(Fragment, {}, slot(props));
        }
        return h(Fragment, {}, slot);
    }
    return "";
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount: function (rooContainer) {
                // 将组件转化为vnode对象
                var vnode = createVNode(rootComponent);
                // 然后在基于虚拟节点进行操作
                render(vnode, parseContain(rooContainer), null);
            }
        };
    };
}
function parseContain(rooContainer) {
    if (typeof rooContainer === "string") {
        return document.querySelector(rooContainer);
    }
    else {
        return rooContainer;
    }
}

/*
  允许用户自定义编译函数，重新createElement,patchProp,insert
*/
function createRenderer(options) {
    var createElement = options.createElement, patchProp = options.patchProp, insert = options.insert;
    function render(vnode, container, parentInstance) {
        // patch
        /*
          主要创建一个instance实例
          执行实例中的setup
          获取到实例中的render函数
          又对render进行patch
        */
        patch(vnode, container, parentInstance);
    }
    function patch(vnode, container, parentInstance) {
        var shapeFlag = vnode.shapeFlag, type = vnode.type;
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentInstance);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    // 处理非组件vnode
                    processElement(vnode, container, parentInstance);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    // 处理组件vnode({setup})等
                    processComponent(vnode, container, parentInstance);
                }
                break;
        }
    }
    // 处理文档碎片
    function processFragment(vnode, container, parentInstance) {
        mountChildren(vnode.children, container, parentInstance);
    }
    function processText(vnode, container) {
        var children = vnode.children;
        var textNode = (vnode.el = document.createTextNode(children));
        container.appendChild(textNode);
    }
    // 实例化元素
    function processElement(vnode, container, parentInstance) {
        // init -> 
        mountElement(vnode, container, parentInstance);
    }
    // 挂载元素
    function mountElement(vnode, container, parentInstance) {
        var _a;
        // 结构数据
        var type = vnode.type, props = vnode.props, children = vnode.children, shapeFlag = vnode.shapeFlag;
        // 生成对应的元素
        var el = (vnode.el = createElement(type));
        // 处理对应的属性添加
        for (var key in props) {
            /*
              要判断处理的prop是否为一个事件函数
              onClick/onMousedown
            */
            patchProp(el, key, props[key]);
        }
        // 当vnode的children不为数组时
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = (_a = children) !== null && _a !== void 0 ? _a : "";
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(children, el, parentInstance);
        }
        // 挂载到父组件中/根组件中
        /*
          最后挂载，节约性能，不会造成回流
        */
        // container.appendChild(el);
        insert(el, container);
    }
    // 挂载子组件
    function mountChildren(children, container, parentInstance) {
        children.forEach(function (component) {
            patch(component, container, parentInstance);
        });
    }
    function processComponent(vnode, container, parentInstance) {
        // 实例化组件
        mountComponent(vnode, container, parentInstance);
    }
    function mountComponent(vnode, container, parentInstance) {
        // 创建一个组件实例
        var instance = createComponentInstance(vnode, parentInstance);
        // 调用setup函数获取到setup函数return出来的数据
        // 然后作为render函数时this
        setupComponent(instance);
        setupRenderEffect(instance, container);
    }
    function setupRenderEffect(instance, container) {
        var proxy = instance.proxy, vnode = instance.vnode;
        // 生成渲染树,所以render不能使用箭头函数
        var subTree = instance.render && instance.render.call(proxy);
        // vnode -> element -> mountElement
        patch(subTree, container, instance);
        // 挂载DOM元素
        vnode.el = subTree.el;
    }
    // 利用闭包返回render函数
    return {
        createApp: createAppApi(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}

function insert(el, parent) {
    parent.appendChild(el);
}

function patchProp(el, key, value) {
    /*
      要判断处理的prop是否为一个事件函数
      onClick/onMousedown
    */
    var isOn = function (key) { return /^on[A-Z]/.test(key); };
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
    }
    else {
        el.setAttribute(key, value);
    }
}

var renderer = createRenderer({ createElement: createElement, patchProp: patchProp, insert: insert });
function createApp(rootContainer) {
    return renderer.createApp(rootContainer);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, renderSlots };
