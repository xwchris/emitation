var TemplateEngine = require('../src/template-engine');

test('test template engine', () => {
  var template =
    'My skills:' +
      '<%for(var index in this.skills) {%>' +
      '<a href=""><%this.skills[index]%></a>' +
    '<%}%>';
  var result = TemplateEngine(template, {skills: ['js', 'css', 'html']})
  expect(result).toBe('My skills:<a href="">js</a><a href="">css</a><a href="">html</a>');
});

function fetchData(callback) {
  setTimeout(() => {
    callback(100);
  }, 200);
}

// Don't do this!
test('the data is pe  anut butter', () => {
  function callback(data) {
    console.log('callback');
    expect(data).toBe('peanut butter');
    // done();
  }ß

  fetchData(callback);
});
