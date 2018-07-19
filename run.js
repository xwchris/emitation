var Animal = function(name) {
  this.name = name;
}

Animal.prototype.getName = function() {
  return this.name;
}

var Dog = function(name) {

  Animal.call(this.name);
  _this.name = name;
}

Dog.prototype = Animal.prototype;
