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

  const _transCamelToKebab = (name) => {
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

  const _createComponent = (constructor, props) => {
    let instance = null;

    if (constructor.prototype && constructor.prototype.render) {
      instance = new constructor(props);
    } else {
      instance = {};
      instance.render = () => { return constructor(props) };
    }

    return instance;
  }

  const _setElementStyle = ($target, style) => {
    let targetStyle = '';

    // style为object或string
    if (typeof style === 'object') {
      targetStyle = Object.keys(style)
        .reduce((result, styleName) => `${result}${_transCamelToKebab(styleName)}: ${style[styleName]}; `, '')
    } else {
      targetStyle = style;
    }
    $target.setAttribute('style', targetStyle);
  }

  const _bindElementEvent = ($target, eventName, event) => {
    const name = _transCamelToKebab(eventName).split('-')[1];
    $target.addEventListener(name, event);
  }

  const _setAttributes = ($target, props) => {
    const attrs = Object.assign({}, props);

    const attrMap = {
      htmlFor: 'for',
      className: 'class'
    };

    // 去除children, 避免它的影响
    delete attrs.children;

    Object.keys(attrs).forEach(key => {
      const value = attrs[key];

      if (key === 'style') {
        _setElementStyle($target, value);
      } else if (/^on.+/.test(key)) {
        _bindElementEvent($target, key, value);
      } else if (key in attrMap){
        $target.setAttribute(attrMap[key], value);
      } else {
        $target.setAttribute(_transCamelToKebab(key), value);
      }
    });
  }

  const _renderComponent = (instance) => {
    const node = instance.render();
    const $node = _renderNode(node);
    _setAttributes($node);

    if (!instance.$base) {
      instance.$base = $node;
    }
    return $node;
  }

  const _renderNode = vnode => {
    const { type, props } = vnode;

    // 如果是函数或类需要先构造对象
    if (typeof type === 'function') {
      const instance = _createComponent(type, props);
      return _renderComponent(instance);
    }

    const $parent = document.createElement(type);
    const children = props.children;

    // 赋值
    _setAttributes($parent, props);

    children.forEach(child => {
      let $child = null;
      if (typeof child === 'string' || typeof child === 'number' || typeof child === 'undefined' || typeof child === 'boolean') {
        $child = document.createTextNode(child);
      } else if (Array.isArray(child)) {
        $child = document.createDocumentFragment();
        child.forEach(node => {
          $child.appendChild(_renderNode(node));
        });
      } else {
        $child = _renderNode(child);
      }
      $parent.appendChild($child);
    });

    return $parent;
  };

  const ReactDOM = {};

  ReactDOM.renderComponent = (instance) => {
    const $node = _renderComponent(instance);
    const $base = instance.$base;
    $base.parentNode.replaceChild($node, $base);
    instance.$base = $node;
  }

  ReactDOM.render = (vnode, $target) => {
    $target.appendChild(_renderNode(vnode));
  }

  return ReactDOM;
});
