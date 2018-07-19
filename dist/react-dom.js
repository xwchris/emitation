'use strict';

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
  // TODO: react virtualDom

  // default direction === true, eg: className = class
  // TODO: finish transform
  var transformCamelToCase = function transformCamelToCase(name) {
    var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

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

  // rend vnode
  var renderNode = function renderNode(vnode) {
    var type = vnode.type,
        props = vnode.props;

    // !! componentWillMount componentWillReceiveProps componentWillUpdate

    var Constructor = type;
    // type if function
    if (type && typeof type === 'function' && !Constructor.prototype.render) {
      return renderNode(type());
    }

    if (type && typeof type === 'function' && Constructor.prototype.render) {
      var instance = new type();
      // !! render
      return renderNode(instance.render());
    }

    // type is string
    var $container = document.createElement(type);

    if (!props) {
      return $container;
    }

    for (var propName in props) {
      if (propName === 'children') {
        var children = props.children;

        if (!children) {
          return $container;
        }

        if (typeof children === 'string' || typeof child === 'number') {
          $container.textContent = children;
        } else {
          // recursive rend child
          children.forEach(function (child) {
            return typeof child === 'string' || typeof child === 'number' ? $container.appendChild(document.createTextNode(child)) : $container.appendChild(renderNode(child));
          });
        }
      } else if (propName === 'style') {
        (function () {
          // style { color: 'red' } => 'color: red;'
          var propValue = props[propName];

          var resultValue = {};
          Object.keys(propValue).map(function (key) {
            resultValue[transformCamelToCase(key)] = propValue[key];
          });
          propValue = Object.keys(resultValue).reduce(function (styleString, styleKey) {
            return '' + styleString + styleKey + ': ' + resultValue[styleKey] + '; ';
          }, '');

          $container.setAttribute(transformCamelToCase(propName), propValue);
        })();
      } else if (/^on/.test(propName)) {

        // event onClick => addEventListener('click', /* function */);
        var eventName = transformCamelToCase(propName).split('-')[1];
        $container.addEventListener(eventName, props[propName]);
      } else {
        $container.setAttribute(transformCamelToCase(propName), props[propName]);
      }
    }

    // !! componentDidMount componentDidUpdate

    return $container;
  };

  var ReactDOM = {};

  ReactDOM.render = function (vnode, target) {
    target.appendChild(renderNode(vnode));
    // !! componentDidMount componentDidUpdate
  };

  return ReactDOM;
});
