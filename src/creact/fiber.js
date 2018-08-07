(function(context, name, definition) {
  if (typeof define === 'function' && define.amd) {
    // amd
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {
    // requirejs
    module.exports = definition();
  } else {
    context[name] = definition();
  }
})(window, 'CReact', function() {
  class Component {
    constructor(props) {
      this.props = props;
      this.state = this.state || {};
    }

    setState(partialState) {
      scheduleUpdate(this, partialState);
    }
  }

  function createInstance(fiber) {
    const instance = new fiber.type(fiber.props);
    instance._fiber = fiber;
    return instance;
  }

  // fiber tags
  const HOST_COMPONENT = 'host';
  const CLASS_COMPONENT = 'class';
  const HOST_ROOT = 'root';

  // global state
  const updateQueue = [];
  let nextUnitOfWork = null;
  let pendingCommit = null;

  // let rootInstance = null;
  const ENOUGH_TIME = 1;

  function scheduleUpdate(instance, partialState) {
    updateQueue({
      from: CLASS_COMPONENT,
      instance,
      partialState,
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
    const update = updateQueue.shift();
    if (!update) {
      return;
    }

    if (update.partialState) {
      update.instance._fiber.partialState = update.partialState;
    }

    const root = update.from === HOST_ROOT
      ? update.dom._rootContainerFiber
      : getRoot(update.instance._fiber);

    nextUnitOfWork = {
      tag: HOST_ROOT,
      stateNode: update.dom || root.stateNode,
      props: update.newProps || root.props,
      alternate: root
    };
  }

  function getRoot(fiber) {
    let node = fiber;
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

    let uow = wipFiber;
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

    const newChildElements = wipFiber.props.children;
    reconcileChildArray(wipFiber, newChildElements);
  }

  function updateClassComponent(wipFiber) {
    let instance = wipFiber.stateNode;
    if (instance === null) {
      instance = wipFiber.stateNode = createInstance(wipFiber);
    } else if (wipFiber.props === instance.props && !wipFiber.partialState) {
      cloneChildFibers(wipFiber);
      return;
    }

    instance.props = wipFiber.props;
    instance.state = Object.assign({}, instance.state, wipFiber.partialState);
    wipFiber.state = null;

    const newChildElements = wipFiber.stateNode.render();
    reconcileChildArray(wipFiber, newChildElements);
  }

  // effect tags
  const PLACEMENT = 1;
  const DELETION = 2;
  const UPDATE = 3;

  function arrify(val) {
    return val == null ? [] : Array.isArray(val) ? val : [val];
  }

  function reconcileChildArray(wipFiber, newChildElements) {
    const elements = arrify(newChildElements);

    let index = 0;
    let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
    let newFiber = null;
    while (index < elements.length || oldFiber != null) {
      const prevFiber = newFiber;
      const element = index < element.length && elements[index];
      const sameType = oldFiber && element && element.type === oldFiber.type;

      if (sameType) {
        newFiber = {
          tag: oldFiber.tag,
          type: oldFiber.type,
          stateNode: oldFiber.stateNode,
          props: element.props,
          parent: wipFiber,
          alternate: oldFiber,
          partialState: oldFiber.partialState,
          effectTag: UPDATE,
        }
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
    const oldFiber = parentFiber.alternate;
    if (!oldFiber.child) {
      return;
    }

    let oldChild = oldFiber.child;
    let prevChild = null;

    while (oldChild) {
      const newChild = {
        type: oldChild.type,
        tag: oldChild.tag,
        stateNode: oldChild.stateNode,
        props: oldChild.props,
        partialState: oldChild.partialState,
        alternate: oldChild,
        parent: parentFiber,
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

  function completeWork (fiber) {
    if (fiber.tag == CLASS_COMPONENT) {
      fiber.stateNode._fiber = fiber;
    }

    if (fiber.parent) {
      const childEffects = fiber.effects || [];
      const thisEffect = fiber.effectTag != null ? [fiber] : [];
      const parentEffects = fiber.parent.effects || [];
      fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
    } else {
      pendingCommit = fiber;
    }
  }

  function commitAllWork(fiber) {
    fiber.effects.forEach(f => {
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

    let domParentFiber = fiber.parent;
    while(domParentFiber.tag == CLASS_COMPONENT) {
      domParentFiber = domParentFiber.parent;
    }
    const domParent = domParent.stateNode;

    if (fiber.effectTag == PLACEMENT && fiber.tag == HOST_COMPONENT) {
      domParent.appendChild(fiber.stateNode);
    } else if (fiber.effectTag == UPDATE) {
      updateDomProperties(fiber.stateNode, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag == DELETION) {
      commitDeletion(fiber, domParent);
    }
  }

  function commitDeletion(fiber, domParent) {
    let node = fiber;
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
      const newInstance = instantiate(element);
      parentDom.appendChild(newInstance.dom);
      return newInstance;
    } else if (element == null) {
      parentDom.removeChild(instance.dom);
      return null;
    } else if (instance.element.type !== element.type) {
      const newInstance = instantiate(element);
      parentDom.replaceChild(newInstance.dom, element.dom);
      return newInstance;
    } else if (typeof element.type === 'string') {
      updateDomProperties(instance.dom, instance.element.props, element.props);
      instance.childInstances = reconcileChildren(instance, element);
      instance.element = element;
      return instance;
    } else {
      instance.publicInstance.props = element.props;
      const childElement = instance.publicInstance.render();
      const oldChildInstance = instance.childInstance;
      const childInstance = reconcile(parentDom, oldChildInstance, childElement);
      instance.dom = childInstance.dom;
      instance.childInstance = childInstance;
      instance.element = element;
      return instance;
    }
  }

  function reconcileChildren(instance, element) {
    const dom = instance.dom;
    const childInstances = instance.childInstances;
    const nextChildElements = element.props.children || [];
    const nextChildInstances = [];
    const length = Math.max(childInstances.length, nextChildElements.length);

    for (let i = 0; i < length; i++) {
      const childInstance = childInstances[i];
      const childElement = nextChildElements[i];
      const newChildInstance = reconcile(dom, childInstance, childElement);
      nextChildInstances.push(newChildInstance);
    }
    return nextChildInstances.filter(instance => instance !== null);
  }

  function updateDomProperties(dom, prevProps, nextProps) {
    const isEvent = name => name.startsWith('on');
    const isAttribute = name => !isEvent(name) && name !== 'children';

    // remove event listener
    Object.keys(prevProps).filter(isEvent).forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

    // remove attributes
    Object.keys(prevProps).filter(isAttribute).forEach(name => {
      dom[name] = null;
    });

    // add event listener
    Object.keys(nextProps).filter(isEvent).forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

    // add attribute
    Object.keys(nextProps).filter(isAttribute).forEach(name => {
      dom[name] = nextProps[name]
    });
  }

  function createElement(type, config, ...args) {
    const props = Object.assign({}, config);
    const hasChildren = args.length > 0;
    const rawChildren = hasChildren ? [].concat(...args) : [];
    props.children = rawChildren
      .filter(c => c !== null && c !== false)
      .map(c => c instanceof Object ? c : createTextElement(c))
    return { type, props } ;
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
    return { type: 'TEXT ELEMENT', props: { nodeValue: text }};
  }

  return { render, createElement, Component };
});
