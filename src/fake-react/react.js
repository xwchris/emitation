(function UMD(context, name, definition) {
  if (typeof define === 'function' && define.amd) {
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {
    context[name] = definition();
  }
})(window, 'React', function() {
  // component
  const Component = function(props) {
    this.props = props;
  }

  Component.prototype.setState = function(nextStates) {
    if (!this.state) {
      throw Error('state is not defined');
    }

    if (typeof nextStates !== 'object' && typeof nextStates !== 'function') {
      throw TypeError(`state can't be ${typeof nextStates}`);
    }

    if (typeof nextStates === 'object') {
      this.state = Object.assign({}, this.state, nextStates);
    } else {
      this.state = Object.assign({}, this.state, nextStates());
    }

    ReactDOM.renderComponent(this);
  }

  Component.prototype.render = (() => {});


  // virtual dom
  const vNode = (type, props, children = null) => {
    return {
      type,
      props: Object.assign({}, props, { children })
    }
  };

  const React = {};

  React.Component = Component;

  // React createElement function
  React.createElement = (type, props, ...children) => {
    return vNode(type, props, children);
  }

  return React;
});
