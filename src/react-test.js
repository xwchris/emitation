const child1 = React.createElement('h1', {}, "hello world");
const app = React.createElement('div', { className: "hello" }, [child1]);
console.log(child1);
console.log(app);
ReactDOM.render(
  app,
  document.getElementById('root')
);
