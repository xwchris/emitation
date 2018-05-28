'use strict';

(function (name, context, definition) {
  if (typeof define === 'function' && define.amd) {
    define(definition);
  } else if (module.exports && exports) {
    module.exports = definition();
  } else {
    context[name] = definition();
  }
})('template-engine', this, function () {

  var templateEngine = function (tpl, data) {
    var reg = /<%(.+?)%>/g;
    var regExp = /(if|else|for|switch|case|break|{|})(.*)?/g;
    var code = 'var r = [];\n';
    var cursor = 0, match;
    var add = function (line, js) {
      return js ? regExp.test(line) ? line + '\n'
        : 'r.push(' + line  + ');\n'
        : 'r.push("' + line.replace(/"/g, '\\"') + '");\n';
    }
    while(match = reg.exec(tpl)) {
      code += add(tpl.slice(cursor, match.index));
      code += add(match[1], true);
      cursor = match.index + match[0].length;
    }
    code += add(tpl.substr(cursor, tpl.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/\r\t\n/g, '')).apply(data);
  }

  return template;
});
