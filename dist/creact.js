'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (context, name, definition) {
  if (typeof define === 'function' && define.amd) {
    // amd
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {
    // requirejs
    module.exports = definition();
  } else {
    context[name] = definition();
  }
})(window, 'CReact', function () {
  var Component = function () {
    function Component(props) {
      _classCallCheck(this, Component);

      this.props = props;
      this.state = this.state || {};
    }

    _createClass(Component, [{
      key: 'setState',
      value: function setState(partialState) {
        scheduleUpdate(this, partialState);
      }
    }]);

    return Component;
  }();

  function createInstance(fiber) {
    var instance = new fiber.type(fiber.props);
    instance._fiber = fiber;
    return instance;
  }

  // fiber tags
  var HOST_COMPONENT = 'host';
  var CLASS_COMPONENT = 'class';
  var HOST_ROOT = 'root';

  // global state
  var updateQueue = [];
  var nextUnitOfWork = null;
  var pendingCommit = null;

  // let rootInstance = null;
  var ENOUGH_TIME = 1;

  function scheduleUpdate(instance, partialState) {
    updateQueue({
      from: CLASS_COMPONENT,
      instance: instance,
      partialState: partialState
    });
    requestIdleCallback(performWork);
  }

  function performWork(deadline) {
    workLoop(deadline);

    if (nextUnitOfWork || updateQueue.length > 0) {
      requestIdleCallback(performWork);
    }
  }

  function workLoop(deadline) {
    if (!nextUnitOfWork) {
      resetNextUnitOfWork();
    }

    while (nextUnitOfWork && deadline.timeRemaining > ENOUGH_TIME) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    if (pendingCommit) {
      commitAllWork(pendingCommit);
    }
  }

  function resetNextUnitOfWork() {
    var update = updateQueue.shift();
    if (!update) {
      return;
    }

    if (update.partialState) {
      update.instance._fiber.partialState = update.partialState;
    }

    var root = update.from === HOST_ROOT ? update.dom._rootContainerFiber : getRoot(update.instance._fiber);

    nextUnitOfWork = {
      tag: HOST_ROOT,
      stateNode: update.dom || root.stateNode,
      props: update.newProps || root.props,
      alternate: root
    };
  }

  function getRoot(fiber) {
    var node = fiber;
    while (root.parent) {
      node = node.parent;
    }
    return node;
  }

  function performUnitOfWork(wipFiber) {
    beginWork(wipFiber);
    if (wipFiber.child) {
      return wipFiber.child;
    }

    var uow = wipFiber;
    while (uow) {
      completeWork(uow);
      if (uow.sibling) {
        return uow.sibling;
      }
      uow = uow.parent;
    }
  }

  function beginWork(wipFiber) {
    if (wipFiber.tag === CLASS_COMPONENT) {
      updateClassComponent(wipFiber);
    } else {
      updateHostComponent(wipFiber);
    }
  }

  function updateHostComponent(wipFiber) {
    if (wipFiber.stateNode) {
      wipFiber.stateNode = createDomElement(wipFiber);
    }

    var newChildElements = wipFiber.props.children;
    reconcileChildArray(wipFiber, newChildElements);
  }

  function updateClassComponent(wipFiber) {
    var instance = wipFiber.stateNode;
    if (instance === null) {
      instance = wipFiber.stateNode = createInstance(wipFiber);
    } else if (wipFiber.props === instance.props && !wipFiber.partialState) {
      cloneChildFibers(wipFiber);
      return;
    }

    instance.props = wipFiber.props;
    instance.state = Object.assign({}, instance.state, wipFiber.partialState);
    wipFiber.state = null;

    var newChildElements = wipFiber.stateNode.render();
    reconcileChildArray(wipFiber, newChildElements);
  }

  // effect tags
  var PLACEMENT = 1;
  var DELETION = 2;
  var UPDATE = 3;

  function arrify(val) {
    return val == null ? [] : Array.isArray(val) ? val : [val];
  }

  function reconcileChildArray(wipFiber, newChildElements) {
    var elements = arrify(newChildElements);

    var index = 0;
    var oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
    var newFiber = null;
    while (index < elements.length || oldFiber != null) {
      var prevFiber = newFiber;
      var element = index < element.length && elements[index];
      var sameType = oldFiber && element && element.type === oldFiber.type;

      if (sameType) {
        newFiber = {
          tag: oldFiber.tag,
          type: oldFiber.type,
          stateNode: oldFiber.stateNode,
          props: element.props,
          parent: wipFiber,
          alternate: oldFiber,
          partialState: oldFiber.partialState,
          effectTag: UPDATE
        };
      }

      if (element && !sameType) {
        newFiber = {
          type: element.type,
          tag: typeof element.type === 'string' ? HOST_COMPONENT : CLASS_COMPONENT,
          props: element.props,
          parent: wipFiber,
          effectTag: PLACEMENT
        };
      }

      if (oldFiber && !sameType) {
        oldFiber.effectTag = DELETION;
        wipFiber.effects = wipFiber.effects || [];
        wipFiber.effects.push(oldFiber);
      }

      if (oldFiber) {
        oldFiber = oldFiber.sibling;
      }

      if (index === 0) {
        wipFiber.child = newFiber;
      } else if (prevFiber && element) {
        prevFiber.sibling = newFiber;
      }

      index++;
    }
  }

  function cloneChildFibers(parentFiber) {
    var oldFiber = parentFiber.alternate;
    if (!oldFiber.child) {
      return;
    }

    var oldChild = oldFiber.child;
    var prevChild = null;

    while (oldChild) {
      var newChild = {
        type: oldChild.type,
        tag: oldChild.tag,
        stateNode: oldChild.stateNode,
        props: oldChild.props,
        partialState: oldChild.partialState,
        alternate: oldChild,
        parent: parentFiber
      };

      if (prevChild) {
        prevChild.sibling = newChild;
      } else {
        parentFiber.child = newChild;
      }

      prevChild = newChild;
      oldChild = oldChild.sibling;
    }
  }

  function completeWork(fiber) {
    if (fiber.tag == CLASS_COMPONENT) {
      fiber.stateNode._fiber = fiber;
    }

    if (fiber.parent) {
      var childEffects = fiber.effects || [];
      var thisEffect = fiber.effectTag != null ? [fiber] : [];
      var parentEffects = fiber.parent.effects || [];
      fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
    } else {
      pendingCommit = fiber;
    }
  }

  function commitAllWork(fiber) {
    fiber.effects.forEach(function (f) {
      commitWork(f);
    });
    fiber.stateNode._rootContainerFiber = fiber;
    nextUnitOfWork = null;
    pendingCommit = null;
  }

  function commitWork(fiber) {
    if (fiber.tag == HOST_ROOT) {
      return;
    }

    var domParentFiber = fiber.parent;
    while (domParentFiber.tag == CLASS_COMPONENT) {
      domParentFiber = domParentFiber.parent;
    }
    var domParent = domParent.stateNode;

    if (fiber.effectTag == PLACEMENT && fiber.tag == HOST_COMPONENT) {
      domParent.appendChild(fiber.stateNode);
    } else if (fiber.effectTag == UPDATE) {
      updateDomProperties(fiber.stateNode, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag == DELETION) {
      commitDeletion(fiber, domParent);
    }
  }

  function commitDeletion(fiber, domParent) {
    var node = fiber;
    while (true) {
      if (node.tag == CLASS_COMPONENT) {
        node = node.child;
        continue;
      }
      domParent.removeChild(node.stateNode);
      while (node != fiber && !node.sibling) {
        node = node.parent;
      }
      if (node == fiber) {
        return;
      }
      node = node.sibling;
    }
  }

  function reconcile(parentDom, instance, element) {
    if (instance == null) {
      var newInstance = instantiate(element);
      parentDom.appendChild(newInstance.dom);
      return newInstance;
    } else if (element == null) {
      parentDom.removeChild(instance.dom);
      return null;
    } else if (instance.element.type !== element.type) {
      var _newInstance = instantiate(element);
      parentDom.replaceChild(_newInstance.dom, element.dom);
      return _newInstance;
    } else if (typeof element.type === 'string') {
      updateDomProperties(instance.dom, instance.element.props, element.props);
      instance.childInstances = reconcileChildren(instance, element);
      instance.element = element;
      return instance;
    } else {
      instance.publicInstance.props = element.props;
      var childElement = instance.publicInstance.render();
      var oldChildInstance = instance.childInstance;
      var childInstance = reconcile(parentDom, oldChildInstance, childElement);
      instance.dom = childInstance.dom;
      instance.childInstance = childInstance;
      instance.element = element;
      return instance;
    }
  }

  function reconcileChildren(instance, element) {
    var dom = instance.dom;
    var childInstances = instance.childInstances;
    var nextChildElements = element.props.children || [];
    var nextChildInstances = [];
    var length = Math.max(childInstances.length, nextChildElements.length);

    for (var i = 0; i < length; i++) {
      var childInstance = childInstances[i];
      var childElement = nextChildElements[i];
      var newChildInstance = reconcile(dom, childInstance, childElement);
      nextChildInstances.push(newChildInstance);
    }
    return nextChildInstances.filter(function (instance) {
      return instance !== null;
    });
  }

  function updateDomProperties(dom, prevProps, nextProps) {
    var isEvent = function isEvent(name) {
      return name.startsWith('on');
    };
    var isAttribute = function isAttribute(name) {
      return !isEvent(name) && name !== 'children';
    };

    // remove event listener
    Object.keys(prevProps).filter(isEvent).forEach(function (name) {
      var eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

    // remove attributes
    Object.keys(prevProps).filter(isAttribute).forEach(function (name) {
      dom[name] = null;
    });

    // add event listener
    Object.keys(nextProps).filter(isEvent).forEach(function (name) {
      var eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

    // add attribute
    Object.keys(nextProps).filter(isAttribute).forEach(function (name) {
      dom[name] = nextProps[name];
    });
  }

  function createElement(type, config) {
    var _ref;

    var props = Object.assign({}, config);

    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    var hasChildren = args.length > 0;
    var rawChildren = hasChildren ? (_ref = []).concat.apply(_ref, args) : [];
    props.children = rawChildren.filter(function (c) {
      return c !== null && c !== false;
    }).map(function (c) {
      return c instanceof Object ? c : createTextElement(c);
    });
    return { type: type, props: props };
  }

  function render(elements, containerDom) {
    updateQueue.push({
      from: HOST_ROOT,
      dom: containerDom,
      newProps: { children: elements }
    });
    requestIdleCallback(performWork);
  }

  function createTextElement(text) {
    return { type: 'TEXT ELEMENT', props: { nodeValue: text } };
  }

  return { render: render, createElement: createElement, Component: Component };
});
