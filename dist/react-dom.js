'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function UMD(context, name, definition) {
  if (typeof define === 'function' && define.amd) {
    // amd
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {
    // requirejs
    module.exports = definition();
  } else {
    context[name] = definition();
  }
})(window, 'ReactDOM', function () {
  // TODO: 完善生命周期

  var _transCamelToKebab = function _transCamelToKebab(name) {
    var transformMap = {
      className: 'class',
      htmlFor: 'for'
    };

    if (name in transformMap) {
      return transformMap[name];
    } else {

      // camelCase => kebabCase
      return name.replace(/[A-Z]/g, function (letter) {
        return '-' + letter.toLowerCase();
      });
    }
  };

  var _attachNodeToTarget = function _attachNodeToTarget($node, $target) {
    $target.appendChild($node);
    if ($node._component && $node._component.componentDidMount) {
      $node._component.componentDidMount();
    }
  };

  var _createComponent = function _createComponent(constructor, props) {
    var instance = null;

    if (constructor.prototype && constructor.prototype.render) {
      instance = new constructor(props);
    } else {
      instance = {};
      instance.render = function () {
        return constructor(props);
      };
    }

    return instance;
  };

  var _setElementStyle = function _setElementStyle($target, style) {
    var targetStyle = '';

    // style为object或string
    if ((typeof style === 'undefined' ? 'undefined' : _typeof(style)) === 'object') {
      targetStyle = Object.keys(style).reduce(function (result, styleName) {
        return '' + result + _transCamelToKebab(styleName) + ': ' + style[styleName] + '; ';
      }, '');
    } else {
      targetStyle = style;
    }
    $target.setAttribute('style', targetStyle);
  };

  var _bindElementEvent = function _bindElementEvent($target, eventName, event) {
    var name = _transCamelToKebab(eventName).split('-')[1];
    $target.addEventListener(name, event);
  };

  var _setAttributes = function _setAttributes($target, props) {
    var attrs = Object.assign({}, props);

    var attrMap = {
      htmlFor: 'for',
      className: 'class'
    };

    // 去除children, 避免它的影响
    delete attrs.children;

    Object.keys(attrs).forEach(function (key) {
      var value = attrs[key];

      if (key === 'style') {
        _setElementStyle($target, value);
      } else if (/^on.+/.test(key)) {
        _bindElementEvent($target, key, value);
      } else if (key in attrMap) {
        $target.setAttribute(attrMap[key], value);
      } else {
        $target.setAttribute(_transCamelToKebab(key), value);
      }
    });
  };

  var _renderComponent = function _renderComponent(instance, props) {
    if (instance.componentWillMount && !instance.$base) {
      instance.componentWillMount();
    } else if (instance.componentWillReceiveProps && instance.$base) {
      instance.componentWillReceiveProps();
    }

    var vnode = instance.render();
    var $node = _renderNode(vnode);
    _setAttributes($node, props);

    if (!instance.$base) {
      instance.$base = $node;
      $node._component = instance;
    }
    return $node;
  };

  var _renderNode = function _renderNode(vnode) {
    var type = vnode.type,
        props = vnode.props;

    // 如果是函数或类需要先构造对象

    if (typeof type === 'function') {
      var instance = _createComponent(type, props);
      return _renderComponent(instance, props);
    }

    var $parent = document.createElement(type);
    var children = props.children;

    // 赋值
    _setAttributes($parent, props);

    children.forEach(function (child) {
      var $child = null;
      if ((typeof child === 'undefined' ? 'undefined' : _typeof(child)) !== 'object') {
        $child = document.createTextNode(child);
      } else if (Array.isArray(child)) {
        $child = document.createDocumentFragment();
        child.forEach(function (node) {
          var $node = _renderNode(node);
          _attachNodeToTarget($node, $child);
        });
      } else {
        $child = _renderNode(child);
      }
      _attachNodeToTarget($child, $parent);
    });

    return $parent;
  };

  var ReactDOM = {};

  ReactDOM.renderComponent = function (instance) {
    if (instance.componentWillUpdate()) {
      instance.componentDidUpdate();
    }
    var $node = _renderComponent(instance, instance.props);
    var $base = instance.$base;
    $base.parentNode.replaceChild($node, $base);
    instance.$base = $node;
    $node._component = instance;

    if (instance.componentDidUpdate) {
      instance.componentDidUpdate();
    }
  };

  ReactDOM.render = function (vnode, $target) {
    var $node = _renderNode(vnode);
    _attachNodeToTarget($node, $target);
  };

  return ReactDOM;
});
