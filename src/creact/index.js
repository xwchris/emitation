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
})(this, 'React', () => {
  const TEXT_ELEMENT = 'TEXT_ELEMENT';

  class Component {
    constructor(props) {
      this.props = props;
      this.state = this.state || {};
    }

    setState(nextState) {
      this.state = Object.assign({}, this.state, nextState);
      updateComponent(this.__internalNode);
    }
  }

  function updateComponent(node) {
    const parentDom = node.dom.parentElement;
    reconcile(parentDom, node, node.element);
  }

  function render(element, containerDom) {
    reconcile(containerDom, null, element)
  }

  function createElement(type, initProps, ...args) {
    const props = Object.assign({}, initProps);
    const rawChildren = args.length > 0 ? [].concat(...args) : [];
    const children = rawChildren
      .filter(child => child != null && child !== false)
      .map(child => child instanceof Object ? child : createTextElement(child));
    props.children = children;
    return { type, props };
  }

  function createTextElement(text) {
    return { type: TEXT_ELEMENT, props: { nodeValue: text } };
  }

  function reconcile(parentDom, oldNode, element) {
    if (oldNode == null) {
      const node = createNode(element);
      parentDom.appendChild(node.dom);
      return node;
    } else if (element == null) {
      const dom = oldNode.dom;
      parentDom.removeChild(dom);
      return null;
    } else if (oldNode.element.type !== element.type) {
      const node = createNode(element);
      parentDom.replaceChild(oldNode.dom, node.dom);
      return node;
    } else if (typeof element.type === 'string') {
      updateProperties(oldNode.dom, oldNode.element.props, element.props);
      oldNode.childNodes = reconcileChildren(oldNode, element);
      oldNode.element = element;
      return oldNode;
    } else {
      oldNode.instance.props = element.props;
      const childElement = oldNode.instance.render();
      const oldChildNode = oldNode.childNode;
      const newChildNode = reconcile(parentDom, oldChildNode, childElement);
      oldNode.childNode = newChildNode;
      oldNode.dom = newChildNode.dom;
      oldNode.element = element;
      return oldNode;
    }
  }

  function reconcileChildren(node, element) {
    const childNodes = node.childNodes || [];
    const newChildElements = element.props.children || [];
    const newChildNodes = [];
    const length = Math.max(childNodes.length, newChildElements.length);
    for (let i = 0; i < length; i++) {
      const newChildNode = reconcile(node.dom, childNodes[i], newChildElements[i]);
      newChildNodes.push(newChildNode);
    }
    return newChildNodes;
  }

  function updateProperties(dom, prevProps, nextProps) {
    const isEvent = name => name.startsWith('on');
    const isAttribute = name => !isEvent(name) && name !== 'children';

    Object.keys(prevProps).filter(isEvent).forEach(name => {
      const eventName = name.toLowerCase().substring(2);
      dom.removeEventListener(eventName, prevProps[name]);
    });

    Object.keys(nextProps).filter(isEvent).forEach(name => {
      const eventName = name.toLowerCase().substring(2);
      dom.addEventListener(eventName, nextProps[name]);
    });

    const props = Object.assign({}, prevProps, nextProps);
    Object.keys(props)
      .filter(isAttribute)
      .filter(name => prevProps[name] !== nextProps[name])
      .forEach(name => {
        dom[name] = nextProps[name] != null ? nextProps[name] : null;
      });
  }

  function createNode(element) {
    const { type, props } = element;
    const isTextElement = type === TEXT_ELEMENT;
    const isComponent = typeof element.type !== 'string';

    if (isComponent) {
      const instance = new type(props);
      const isClassComponent = !!instance.render;
      const childElement = isClassComponent ? instance.render() : type(props);
      const childNode = createNode(childElement);
      const dom = childNode.dom;
      const node = { dom, element, childNode, instance };
      instance.__internalNode = node;
      return node;
    }

    const dom = isTextElement ? document.createTextNode('') : document.createElement(type);
    updateProperties(dom, {}, props);
    const childElements = props.children || [];
    const childNodes = childElements.map(createNode);
    childNodes.forEach(childNode => { dom.appendChild(childNode.dom); });

    return { dom, element, childNodes }
  }

  return { render, createElement, Component }
});
