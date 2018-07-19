const test = (...children) => {
  console.log('children', children);
}

test(1, 2, [4, 5], 6);
