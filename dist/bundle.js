'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = importReact();

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = {
      count: 1
    };
    return _this;
  }

  _createClass(App, [{
    key: 'onIncreaseCount',
    value: function onIncreaseCount() {
      this.setState({
        count: this.state.count + 1
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      return React.createElement(
        'div',
        { className: 'container' },
        this.props.children,
        React.createElement(
          'h1',
          null,
          this.state.count
        ),
        React.createElement(
          'button',
          { onClick: function onClick() {
              return _this2.onIncreaseCount();
            } },
          'click me'
        )
      );
    }
  }]);

  return App;
}(React.Component);

React.render(React.createElement(
  App,
  null,
  React.createElement(
    'h1',
    null,
    'hello world'
  )
), document.getElementById('root'));

function importReact() {
  // let rootNode = null;
  var TEXT_ELEMENT = 'TEXT_ELEMENT';

  var Component = function () {
    function Component(props) {
      _classCallCheck(this, Component);

      this.props = props;
      this.state = this.state || {};
    }

    _createClass(Component, [{
      key: 'setState',
      value: function setState(nextState) {
        this.state = Object.assign({}, this.state, nextState);
        updateComponent(this.__internalNode);
      }
    }]);

    return Component;
  }();

  function updateComponent(node) {
    var parentDom = node.dom.parentElement;
    reconcile(parentDom, node, node.element);
  }

  function render(element, containerDom) {
    reconcile(containerDom, null, element);
  }

  function createElement(type, initProps) {
    var _ref;

    var props = Object.assign({}, initProps);

    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    var rawChildren = args.length > 0 ? (_ref = []).concat.apply(_ref, args) : [];
    var children = rawChildren.filter(function (child) {
      return child != null && child !== false;
    }).map(function (child) {
      return child instanceof Object ? child : createTextElement(child);
    });
    props.children = children;
    return { type: type, props: props };
  }

  function createTextElement(text) {
    return { type: TEXT_ELEMENT, props: { nodeValue: text } };
  }

  function reconcile(parentDom, oldNode, element) {
    if (oldNode == null) {
      var node = createNode(element);
      parentDom.appendChild(node.dom);
      return node;
    } else if (element == null) {
      var dom = oldNode.dom;
      parentDom.removeChild(dom);
      return null;
    } else if (oldNode.element.type !== element.type) {
      var _node = createNode(element);
      parentDom.replaceChild(oldNode.dom, _node.dom);
      return _node;
    } else if (typeof element.type === 'string') {
      updateProperties(oldNode.dom, oldNode.element.props, element.props);
      oldNode.childNodes = reconcileChildren(oldNode, element);
      oldNode.element = element;
      return oldNode;
    } else {
      oldNode.instance.props = element.props;
      var childElement = oldNode.instance.render();
      var oldChildNode = oldNode.childNode;
      var newChildNode = reconcile(parentDom, oldChildNode, childElement);
      oldNode.childNode = newChildNode;
      oldNode.dom = newChildNode.dom;
      oldNode.element = element;
      return oldNode;
    }
  }

  function reconcileChildren(node, element) {
    var childNodes = node.childNodes || [];
    var newChildElements = element.props.children || [];
    var newChildNodes = [];
    var length = Math.max(childNodes.length, newChildElements.length);
    for (var i = 0; i < length; i++) {
      var newChildNode = reconcile(node.dom, childNodes[i], newChildElements[i]);
      newChildNodes.push(newChildNode);
    }
    return newChildNodes;
  }

  function updateProperties(dom, prevProps, nextProps) {
    var isEvent = function isEvent(name) {
      return name.startsWith('on');
    };
    var isAttribute = function isAttribute(name) {
      return !isEvent(name) && name !== 'children';
    };

    Object.keys(prevProps).filter(isEvent).forEach(function (name) {
      var eventName = name.toLowerCase().substring(2);
      dom.removeEventListener(eventName, prevProps[name]);
    });

    Object.keys(nextProps).filter(isEvent).forEach(function (name) {
      var eventName = name.toLowerCase().substring(2);
      dom.addEventListener(eventName, nextProps[name]);
    });

    var props = Object.assign({}, prevProps, nextProps);
    Object.keys(props).filter(isAttribute).filter(function (name) {
      return prevProps[name] !== nextProps[name];
    }).forEach(function (name) {
      dom[name] = nextProps[name] != null ? nextProps[name] : null;
    });
  }

  function createNode(element) {
    var type = element.type,
        props = element.props;

    var isTextElement = type === TEXT_ELEMENT;
    var isComponent = typeof element.type !== 'string';

    if (isComponent) {
      var instance = new type(props);
      var isClassComponent = !!instance.render;
      var childElement = isClassComponent ? instance.render() : type(props);
      var childNode = createNode(childElement);
      var _dom = childNode.dom;
      var node = { dom: _dom, element: element, childNode: childNode, instance: instance };
      instance.__internalNode = node;
      return node;
    }

    var dom = isTextElement ? document.createTextNode('') : document.createElement(type);
    updateProperties(dom, {}, props);
    var childElements = props.children || [];
    var childNodes = childElements.map(createNode);
    childNodes.forEach(function (childNode) {
      dom.appendChild(childNode.dom);
    });

    return { dom: dom, element: element, childNodes: childNodes };
  }

  return { render: render, createElement: createElement, Component: Component };
}
