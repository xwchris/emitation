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
})(window, 'ReactDOM', function() {
  // TODO: react virtualDom

  // default direction === true, eg: className = class
  // TODO: finish transform
  const transformCamelToCase = (name, direction = true) => {
    const transformMap = {
      className: 'class',
      htmlFor: 'for'
    }

    if (name in transformMap) {
      return transformMap[name];
    } else {
      // camelCase => kebabCase
      return name.replace(/[A-Z]/g, (letter) => (`-${letter.toLowerCase()}`));
    }
  }

  // rend vnode
  const renderNode = (vnode) => {
    const { type, props } = vnode;

    // !! componentWillMount componentWillReceiveProps componentWillUpdate

    const Constructor = type;
    // type if function
    if (type && typeof type === 'function' && !Constructor.prototype.render) {
      return renderNode(type());
    }

    if (type && typeof type === 'function' && Constructor.prototype.render) {
      const instance = new type();
      // !! render
      return renderNode(instance.render());
    }

    // type is string
    const $container = document.createElement(type);

    if (!props) {
      return $container;
    }

    for (let propName in props) {
      if (propName === 'children') {
        const children = props.children;

        if (!children) {
          return $container;
        }

        if (typeof children === 'string' || typeof child === 'number') {
          $container.textContent = children;
        } else {
          // recursive rend child
          children.forEach(child => (
            typeof child === 'string' || typeof child === 'number' ?
              $container.appendChild(document.createTextNode(child)) :
              $container.appendChild(renderNode(child))
            )
          )
        }
      } else if (propName === 'style') {
        // style { color: 'red' } => 'color: red;'
        let propValue = props[propName];

        const resultValue = {};
        Object.keys(propValue).map(key => {
          resultValue[transformCamelToCase(key)] = propValue[key];
        });
        propValue = Object.keys(resultValue)
          .reduce((styleString, styleKey) => (`${styleString}${styleKey}: ${resultValue[styleKey]}; `),'');

        $container.setAttribute(transformCamelToCase(propName), propValue);
      } else if (/^on/.test(propName)) {

        // event onClick => addEventListener('click', /* function */);
        const eventName = transformCamelToCase(propName).split('-')[1];
        $container.addEventListener(eventName, props[propName]);
      } else {
        $container.setAttribute(transformCamelToCase(propName), props[propName]);
      }
    }

    // !! componentDidMount componentDidUpdate

    return $container;
  }

  const ReactDOM = {};

  ReactDOM.render = function (vnode, target) {
    target.appendChild(renderNode(vnode));
    // !! componentDidMount componentDidUpdate
  }

  return ReactDOM;
});
