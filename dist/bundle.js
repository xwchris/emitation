"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = {
      count: 1
    };

    _this.increaseCount = _this.increaseCount.bind(_this);
    return _this;
  }

  _createClass(App, [{
    key: "increaseCount",
    value: function increaseCount() {
      this.setState({
        count: this.state.count + 1
      });
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "container" },
        React.createElement(
          "h1",
          { style: { backgroundColor: 'red' } },
          "Count: ",
          this.state.count
        ),
        React.createElement(
          "button",
          { onClick: this.increaseCount },
          "click me + 1"
        )
      );
    }
  }]);

  return App;
}(React.Component);

var Test = function Test(_ref) {
  var children = _ref.children;
  return React.createElement(
    "div",
    { className: "test-container" },
    React.createElement(
      "h2",
      null,
      "test"
    ),
    React.createElement(App, null),
    React.createElement(
      "h4",
      null,
      "test bottom"
    )
  );
};

ReactDOM.render(React.createElement(Test, null), document.getElementById('root'));
