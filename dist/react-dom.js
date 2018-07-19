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

  var _renderComponent = function _renderComponent(instance) {
    var node = instance.render();
    var $node = _renderNode(node);
    _setAttributes($node);

    if (!instance.$base) {
      instance.$base = $node;
    }
    return $node;
  };

  var _renderNode = function _renderNode(vnode) {
    var type = vnode.type,
        props = vnode.props;

    // 如果是函数或类需要先构造对象

    if (typeof type === 'function') {
      var instance = _createComponent(type, props);
      return _renderComponent(instance);
    }

    var $parent = document.createElement(type);
    var children = props.children;

    // 赋值
    _setAttributes($parent, props);

    children.forEach(function (child) {
      var $child = null;
      if (typeof child === 'string' || typeof child === 'number' || typeof child === 'undefined' || typeof child === 'boolean') {
        $child = document.createTextNode(child);
      } else if (Array.isArray(child)) {
        $child = document.createDocumentFragment();
        child.forEach(function (node) {
          $child.appendChild(_renderNode(node));
        });
      } else {
        $child = _renderNode(child);
      }
      $parent.appendChild($child);
    });

    return $parent;
  };

  var ReactDOM = {};

  ReactDOM.renderComponent = function (instance) {
    var $node = _renderComponent(instance);
    var $base = instance.$base;
    $base.parentNode.replaceChild($node, $base);
    instance.$base = $node;
  };

  ReactDOM.render = function (vnode, $target) {
    $target.appendChild(_renderNode(vnode));
  };

  return ReactDOM;
});
