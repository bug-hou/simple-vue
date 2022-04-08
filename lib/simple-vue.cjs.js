'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const hasChange = Object.is;
const hasOwn = Reflect.has;
const isObject = (value) => value !== null && typeof value === "object";
const capitalize = (str) => str.slice(0, 1).toUpperCase() + str.slice(1);
const camelize = (str) => str.replace(/-(\w)/g, (_, s) => s.toUpperCase());
const isArray = Array.isArray;
const EMPTY_OBJ = {};

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));
function getShapeFlages(type) {
    return typeof type === "string" ? 1 : 2;
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Fragment");
function createVNode(type, props = {}, children) {
    const vnode = {
        type,
        props,
        children,
        key: props.key,
        shapeFlag: getShapeFlages(type),
        el: null
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= 4;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8;
    }
    if ((vnode.shapeFlag & 2)) {
        if ((typeof children === "object") && (!isArray(children))) {
            vnode.shapeFlag |= 16;
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

class ReactiveEffect {
    constructor(effectFn, scheduler) {
        this.deps = new Array();
        this.active = true;
        this.scheduler = scheduler;
        this.effectFn = effectFn;
    }
    run() {
        activeFn = this;
        const result = this.effectFn();
        activeFn = null;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            this.onStop ? this.onStop() : null;
            this.active = false;
        }
    }
}
const targetMap = new WeakMap();
let activeFn;
function cleanupEffect(effect) {
    effect.deps.forEach(dep => {
        dep.delete(effect);
    });
}
function effect(fn, options = {}) {
    const effect = new ReactiveEffect(fn, options.scheduler);
    extend(effect, options);
    effect.run();
    const runner = effect.run.bind(effect);
    runner.effect = effect;
    return runner;
}
function track(target, key) {
    if (activeFn) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            depsMap = new Map();
            targetMap.set(target, depsMap);
        }
        let dep = depsMap.get(key);
        if (!dep) {
            dep = new Set();
            depsMap.set(key, dep);
        }
        dep.add(activeFn);
        activeFn.deps.push(dep);
    }
}
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap === null || depsMap === void 0 ? void 0 : depsMap.get(key);
    dep === null || dep === void 0 ? void 0 : dep.forEach(effect => {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    });
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const readonlySet = createSetter(true);
const shallowReadonlyGet = createGetter(true, true);
const shallowReadonlySet = readonlySet;
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        if (key === "__v_isReactive") {
            return !isReadonly;
        }
        if (key === "__v_isReadonly") {
            return isReadonly;
        }
        const result = Reflect.get(target, key, receiver);
        if (!shallow) {
            if (isObject(result)) {
                if (isReadonly) {
                    return readonly(result);
                }
                return reactive(result);
            }
        }
        if (!isReadonly) {
            track(target, key);
        }
        return result;
    };
}
function createSetter(isReadonly = false) {
    return function set(target, key, value, receiver) {
        if (isReadonly) {
            throw new SyntaxError("当前对象设置为只读不能修改");
        }
        const result = Reflect.set(target, key, value, receiver);
        trigger(target, key);
        return result;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set: readonlySet,
};
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set: shallowReadonlySet
};

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
    ReactiveFlags["IS_REF"] = "__v_isRef";
})(ReactiveFlags || (ReactiveFlags = {}));
function createActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function isReactive(raw) {
    return !!raw["__v_isReactive"];
}
function isReadonly(raw) {
    return !!raw["__v_isReadonly"];
}
function isProxy(raw) {
    return isReactive(raw) || isReadonly(raw);
}

var _a;
class Ref {
    constructor(value) {
        this[_a] = true;
        this._rawValue = value;
        this._value = convert(value);
    }
    get value() {
        track(this, "_value");
        return this._value;
    }
    set value(val) {
        if (hasChange(val, this._rawValue))
            return;
        this._value = convert(val);
        this._rawValue = val;
        trigger(this, "_value");
    }
}
_a = "__v_isRef";
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new Ref(value);
}
function isRef(value) {
    return !!value["__v_isRef"];
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(object) {
    return new Proxy(object, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key] && !isRef(value))) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function emit(instance, eventName, ...payload) {
    const { props } = instance;
    const handlerName = "on" + capitalize(camelize(eventName));
    const handler = props && props[handlerName];
    handler && handler(...payload);
}

function initProps(instance, props) {
    instance.props = props;
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props || {}, key)) {
            return props && props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    const { shapeFlag } = instance.vnode;
    const slots = {};
    if ((shapeFlag & 16) && !isArray(children)) {
        for (const key in children) {
            const value = children[key];
            if (typeof value === "function") {
                slots[key] = (props) => normalizeObjectSlotValue(value(props));
            }
            else {
                slots[key] = normalizeObjectSlotValue(value);
            }
        }
        instance.slots = slots;
    }
    else {
        instance.slots["default"] = normalizeObjectSlotValue(children);
    }
}
function normalizeObjectSlotValue(value) {
    return isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    var _a;
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        slots: {},
        provides: (_a = parent === null || parent === void 0 ? void 0 : parent.provides) !== null && _a !== void 0 ? _a : {},
        parent: parent,
        isMounted: false,
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    var _a;
    initProps(instance, instance.vnode.props);
    initSlots(instance, (_a = instance.vnode.children) !== null && _a !== void 0 ? _a : "");
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    if (typeof Component !== "string") {
        const { setup } = Component;
        let setupResult;
        if (setup) {
            setCurrentInstance(instance);
            setupResult = setup.call(null, shallowReadonly(instance.props), { emit: instance.emit });
            setCurrentInstance(null);
        }
        handleSetupResult(instance, setupResult !== null && setupResult !== void 0 ? setupResult : {});
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "function") {
        instance.setupState = setupResult();
    }
    else {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    if (typeof instance.type !== "string") {
        const Component = instance.type;
        instance.render = Component === null || Component === void 0 ? void 0 : Component.render;
    }
}
let currentInstance;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance = null) {
    currentInstance = instance;
}

function provide(key, value) {
    var _a, _b;
    const instance = getCurrentInstance();
    if (instance) {
        let { parent } = instance;
        if (instance.provides === ((_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provides)) {
            instance.provides = Object.create((_b = parent === null || parent === void 0 ? void 0 : parent.provides) !== null && _b !== void 0 ? _b : null);
        }
        instance.provides[key] = value;
    }
}

function inject(key, defaultValue) {
    var _a;
    const instance = getCurrentInstance();
    if (instance) {
        let { parent } = instance;
        return (_a = parent === null || parent === void 0 ? void 0 : parent.provides[key]) !== null && _a !== void 0 ? _a : defaultValue;
    }
}

function renderSlots(slots, name = "default", props = {}) {
    const slot = slots[name];
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
            mount(rooContainer) {
                const vnode = createVNode(rootComponent);
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

function createRenderer(options) {
    const { createElement, patchProp, insert, remove, setElementText } = options;
    function render(vnode, container, parentInstance) {
        patch(null, vnode, container, parentInstance);
    }
    function patch(n1, n2, container, parentInstance, anchor) {
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentInstance);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1) {
                    processElement(n1, n2, container, parentInstance, anchor);
                }
                else if (shapeFlag & 2) {
                    processComponent(n1, n2, container, parentInstance);
                }
                break;
        }
    }
    function processFragment(n1, n2, container, parentInstance) {
        mountChildren(n2.children, container, parentInstance);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.appendChild(textNode);
    }
    function processElement(n1, n2, container, parentInstance, anchor) {
        if (!n1) {
            mountElement(n2, container, parentInstance, anchor);
        }
        else {
            patchElement(n1, n2, container, parentInstance);
        }
    }
    function patchElement(n1, n2, container, parentInstance) {
        console.log("patchElement");
        const el = (n2.el = n1.el);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        patchChildren(n1, n2, el, parentInstance);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentInstance) {
        const shapeFlag = n2.shapeFlag;
        const prevShapeFlag = n1.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & 4) {
            if (prevShapeFlag & 8) {
                unmountChildren(c1);
            }
            if (c1 !== c2) {
                setElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 4) {
                setElementText(container, "");
                mountChildren(c2, container, parentInstance);
            }
            else {
                patchKeyedChildren(c1, c2, container, parentInstance);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentInstance) {
        let l = 0, oldR = c1.length - 1, newR = c2.length - 1;
        while (l <= oldR && l <= newR) {
            const n1 = c1[l];
            const n2 = c2[l];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentInstance);
            }
            else {
                break;
            }
            l++;
        }
        while (l <= oldR && l <= newR) {
            const n1 = c1[oldR];
            const n2 = c2[newR];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentInstance);
            }
            else {
                break;
            }
            oldR--;
            newR--;
        }
        if (l > oldR) {
            let anchor;
            if (l + 1 < c2.length && oldR + 1 < c1.length) {
                anchor = c1[oldR + 1].el;
            }
            while (l <= newR) {
                patch(null, c2[l], container, parentInstance, anchor);
                l++;
            }
        }
        else if (l > newR) {
            while (l <= oldR) {
                remove(c1[l].el);
                l++;
            }
        }
        else {
            let patched = 0;
            const toBePatched = newR - l + 1;
            const keyToNewIndexMap = new Map();
            for (let i = l; i <= newR; i++) {
                const preNode = c2[i];
                if (preNode.key) {
                    keyToNewIndexMap.set(preNode.key, i);
                }
            }
            for (let i = l; i <= oldR; i++) {
                const oldNode = c1[i];
                if (patched >= toBePatched) {
                    remove(oldNode.el);
                    continue;
                }
                let indexKey;
                if (oldNode.key) {
                    if (keyToNewIndexMap.has(oldNode.key)) {
                        indexKey = keyToNewIndexMap.get(oldNode.key);
                    }
                }
                else {
                    for (let j = l; j < newR; i++) {
                        if (isSameVNodeType(oldNode, c2[j])) {
                            indexKey = j;
                            break;
                        }
                    }
                }
                if (!indexKey) {
                    remove(oldNode.el);
                }
                else {
                    patch(oldNode, c2[indexKey], container, parentInstance);
                    patched++;
                }
            }
        }
        function isSameVNodeType(n1, n2) {
            if (n1.key && n2.key) {
                return n1.key === n2.key && n1.type === n2.type;
            }
            else {
                return n1.type === n2.type;
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            remove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    patchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        patchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentInstance, anchor) {
        var _a;
        const { type, props, children, shapeFlag } = vnode;
        const el = (vnode.el = createElement(type));
        for (const key in props) {
            patchProp(el, key, null, props[key]);
        }
        if (shapeFlag & 4) {
            el.textContent = (_a = children) !== null && _a !== void 0 ? _a : "";
        }
        else if (shapeFlag & 8) {
            mountChildren(children, el, parentInstance);
        }
        insert(el, container, anchor);
    }
    function mountChildren(children, container, parentInstance) {
        children.forEach(component => {
            patch(null, component, container, parentInstance);
        });
    }
    function processComponent(n1, n2, container, parentInstance) {
        mountComponent(n2, container, parentInstance);
    }
    function mountComponent(vnode, container, parentInstance) {
        const instance = createComponentInstance(vnode, parentInstance);
        setupComponent(instance);
        setupRenderEffect(instance, container);
    }
    function setupRenderEffect(instance, container) {
        effect(() => {
            var _a;
            if (!instance.isMounted) {
                console.log("init");
                const { proxy, vnode } = instance;
                const subTree = (instance.subTree = instance.render && instance.render.call(proxy));
                patch(null, subTree, container, instance);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                const { proxy } = instance;
                const oldSubTree = (_a = instance.subTree) !== null && _a !== void 0 ? _a : null;
                const newSubTree = instance.render && instance.render.call(proxy);
                patch(oldSubTree, newSubTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppApi(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}

function insert(el, parent, anchor) {
    if (anchor) {
        parent.insertBefore(el, anchor);
        return;
    }
    parent.appendChild(el);
}

function patchProp(el, key, preValue, nextValue) {
    const isOn = key => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), nextValue);
    }
    else {
        if (nextValue === undefined || nextValue === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}

function remove(el) {
    const parent = el.parentNode;
    parent === null || parent === void 0 ? void 0 : parent.removeChild(el);
}

function setElementText(el, text) {
    el.textContent = text;
}

const renderer = createRenderer({ createElement, patchProp, insert, remove, setElementText });
function createApp(rootContainer) {
    return renderer.createApp(rootContainer);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.renderSlots = renderSlots;
