/**
 * promise
 *
 * @file promise
 * @author xwchris
 */

 (function UMD(name, context, definition) {

  // amd
  if (typeof define === 'function' && define.amd) {
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {
    context[name] = definition;
  }
 })('Promise', this, function () {

  // promise constructor
  var Promise = function (executionFunc) {
    this.promiseEvents = [];

    this.handleError = function() {};

    this.onResolve = this.onResolve.bind(this);
    this.onReject = this.onReject.bind(this);

    // wait then to store all resolve
    executionFunc(this.onResolve, this.onReject);
  }

  // promise then
  Promise.prototype.then = function (resolve, reject) {
    this.promiseEvents.push(resolve);

    return this;
  }

  // promise catch
  Promise.prototype.catch = function (handleError) {
    this.handleError = handleError;

    return this;
  }

  // promise onResolve
  Promise.prototype.onResolve = function (value) {
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

  // promise oReject
  Promise.prototype.onReject = function (error) {
    this.handleError(error);
  }

  return Promise;
 });
