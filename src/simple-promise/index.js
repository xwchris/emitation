/**
 * promise
 *
 * @file simple promise imitation
 * @author xwchris
 */

 (function UMD(name, context, definition) {

  // amd
  if (typeof define === 'function' && define.amd) {
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {
    context[name] = definition();
  }
 })('simple-promise', this, function () {

  // promise constructor
  var SimplePromise = function (executionFunc) {
    this.promiseEvents = [];

    this.handleError = function() {};

    this.onResolve = this.onResolve.bind(this);
    this.onReject = this.onReject.bind(this);

    // wait then to store all resolve
    executionFunc(this.onResolve, this.onReject);
  }

  // promise then
  SimplePromise.prototype.then = function (resolve, reject) {
    this.promiseEvents.push(resolve);

    return this;
  }

  // promise catch
  SimplePromise.prototype.catch = function (handleError) {
    this.handleError = handleError;

    return this;
  }

  // promise onResolve
  SimplePromise.prototype.onResolve = function (value) {
    var storeValue = value;
    try {
      this.promiseEvents.forEach(function (nextFunction) {
        storeValue = nextFunction(storeValue);
      })
    } catch (err) {
      this.promiseEvents = [];
      this.handleError(err);
    }
  }

  // promise onReject
  SimplePromise.prototype.onReject = function (error) {
    this.handleError(error);
  }

  return Promise;
 });
