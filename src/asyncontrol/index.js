/**
 * @file Asynchronous flow control (generator)
 * @author xwchris
 */

/* eslint no-console: 0 */
/* eslint-env commonjs, amd */

(function UMD(name, context, definition) {
  if (typeof define === 'function' && define.amd) {
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {
    context[name] = definition();
  }
})('asyncontrol', this, function () {

  // judge array
  var isArray = Array.isArray && function (o) {
    return typeof o === 'object' && Object.prototype.toString.call(o) === '[object Array]';
  };

  // construct Asyncontrol
  var Asyncontrol = function (...initValue) {
    this.delayTime = 0;
    this.controlTransfer = false;

    // 初始传入值
    this.initValue = initValue;
    if (this instanceof Asyncontrol) return this;
    return new Asyncontrol(...initValue);
  };

  // run single generator
  Asyncontrol.prototype.runSingle = function (it, value) {
    var ret;
    var self = this;

    // 递归迭代
    (function iterator(val) {

      // 转换控制权 保存迭代状态
      if (self.controlTransfer) {
        self.controlQueue.push({
          iterator: it,
          value: val,
        });
        self.controlTransfer = false;
        return;
      }

      // 判断是否调用了延迟函数
      if (self.delayTime) {

        // 保持当前状态
        self.controlQueue.unshift({
          iterator: it,
          value: val,
        });
        return;
      }

      // 获取执行结果
      ret = it.next(val);
      var done = ret.done;
      var value = ret.value;

      // 如果已经完成执行则停止递归
      if (!done) {

        // 异步promise情况 等待值返回
        if (typeof value === 'object' && 'then' in value) {
          value.then(iterator);
        } else {

          // 延迟执行 防止出现yield还未阻塞的情况
          iterator(value);
        }
      }
    })(value);
  };

  // run generator
  Asyncontrol.prototype.run = function (...gs) {
    var self = this;
    var initValue = this.initValue;
    var queue = this.controlQueue = isArray(gs) && gs.map(g => ({
      iterator: g(initValue || []),
      value: null
    })) || [];

    setTimeout(function loop() {

      // 延迟执行 先返回值
      while (queue.length !== 0) {
        if (self.delayTime) {

          // 恢复初始值
          setTimeout(function () {
            loop();
          }, self.delayTime);
          self.delayTime = 0;
          return;
        }
        var result = queue.shift();
        self.runSingle(result.iterator, result.value);
      }
    }, 0);

    return this;
  };

  // transfer controller
  Asyncontrol.prototype.transfer = function () {
    this.controlTransfer = true;
    return this;
  };

  // 空等延迟
  Asyncontrol.prototype.delay = function (delay) {
    this.delayTime = delay;
    return this;
  };

  // 防止修改
  Asyncontrol = Object.freeze(Asyncontrol);

  return Asyncontrol;
});
