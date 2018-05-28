const TemplateEngine = require('./template');

// var template = '<p>Hello, my name is <%name%>. I\'m <%age%> years old.</p>';
var template = 'My skills:' +
'<%for(var index in this.skills) {%>' +
'<a href=""><%this.skills[index]%></a>' +
'<%}%>';
console.log(TemplateEngine(template, {skills: ['js', 'css', 'html']}));
