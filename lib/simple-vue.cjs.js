'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // initProps();
    // initSlots();
    // 初始化一个有状态的setup对象
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({}, {
        get: function (target, key, receiver) {
            var setupState = instance.setupState;
            if (key in setupState) {
                return setupState[key];
            }
            // return Reflect.get(target, key, receiver)
        }
    });
    if (typeof Component !== "string") {
        var setup = Component.setup;
        if (setup) {
            // 执行setup函数
            var setupResult = setup();
            handleSetupResult(instance, setupResult);
        }
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "function") {
        instance.setupState = setupResult();
    }
    else {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    if (typeof instance.type !== "string") {
        var Component = instance.type;
        if (Component.render) {
            instance.render = Component.render;
        }
    }
}

function render(vnode, container) {
    // patch
    /*
      主要创建一个instance实例
      执行实例中的setup
      获取到实例中的render函数
      又对render进行patch
    */
    patch(vnode, container);
}
function patch(vnode, container) {
    if (typeof vnode.type === "string") {
        // 处理非组件vnode
        processElement(vnode, container);
    }
    else {
        // 处理组件vnode({setup})等
        processComponent(vnode, container);
    }
}
// 实例化元素
function processElement(vnode, container) {
    // init -> 
    mountElement(vnode, container);
}
// 挂载元素
function mountElement(vnode, container) {
    // 结构数据
    var type = vnode.type, props = vnode.props, children = vnode.children;
    // 生成对应的元素
    var el = document.createElement(type);
    for (var key in props) {
        el.setAttribute(key, props[key]);
    }
    // 当vnode的children不为数组时
    if (typeof children === "string") {
        el.textContent = children !== null && children !== void 0 ? children : "";
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    // 挂载到父组件中/根组件中
    /*
      最后挂载，节约性能，不会造成回流
    */
    container.appendChild(el);
}
// 挂载子组件
function mountChildren(children, container) {
    children.forEach(function (component) {
        patch(component, container);
    });
}
function processComponent(vnode, container) {
    // 实例化组件
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    // 创建一个组件实例
    var instance = createComponentInstance(vnode);
    // 调用setup函数获取到setup函数return出来的数据
    // 然后作为render函数时this
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    var proxy = instance.proxy;
    // 生成渲染树
    var subTree = instance.render && instance.render.call(proxy);
    // vnode -> element -> mountElement
    patch(subTree, container);
}

function createVNode(type, props, children) {
    if (props === void 0) { props = {}; }
    var vnode = {
        type: type,
        props: props,
        children: children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount: function (rooContainer) {
            // 将组件转化为vnode对象
            var vnode = createVNode(rootComponent);
            // 然后在基于虚拟节点进行操作
            render(vnode, parseContain(rooContainer));
        }
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

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
