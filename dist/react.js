'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function UMD(context, name, definition) {
  if (typeof define === 'function' && define.amd) {
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {
    context[name] = definition();
  }
})(window, 'React', function () {
  // component
  var Component = function Component(props) {
    this.props = props;
  };

  Component.prototype.setState = function (nextStates) {
    if (!this.state) {
      throw Error('state is not defined');
    }

    if ((typeof nextStates === 'undefined' ? 'undefined' : _typeof(nextStates)) !== 'object' && typeof nextStates !== 'function') {
      throw TypeError('state can\'t be ' + (typeof nextStates === 'undefined' ? 'undefined' : _typeof(nextStates)));
    }

    if ((typeof nextStates === 'undefined' ? 'undefined' : _typeof(nextStates)) === 'object') {
      this.state = Object.assign({}, this.state, nextStates);
    } else {
      this.state = Object.assign({}, this.state, nextStates());
    }

    ReactDOM.renderComponent(this);
  };

  Component.prototype.render = function () {};

  // virtual dom
  var vNode = function vNode(type, props) {
    var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return {
      type: type,
      props: Object.assign({}, props, { children: children })
    };
  };

  var React = {};

  React.Component = Component;

  // React createElement function
  React.createElement = function (type, props) {
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    return vNode(type, props, children);
  };

  return React;
});
