const MPromise = require('./promise');

new MPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 0);
}).then(data => {
  return 2;
}).then(data => {
  console.log('hello', data);
}).catch(err => {
  console.log('---', err);
});
