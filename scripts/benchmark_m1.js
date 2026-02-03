const distribution = require('../distribution.js')();
const util = distribution.util;

function benchmark(data, iter = 1000) {
  const start = performance.now();
  for (let i = 0; i < iter; i++) {
    util.deserialize(util.serialize(data));
  };
  const total = performance.now() - start;
  console.log(`Avg: ${total / iter} ms over ${iter} runs`);
}
const T2Data = [
  42,
  3.14159,
  Infinity,
  -Infinity,
  NaN,
  0.1 + 0.2,
  1e308,
  'hello world',
  true,
  false,
];

console.log(`T2: ${T2Data.length} cases per iteration`);
benchmark(T2Data);
const T3Data = [
  function add(a, b) {
    return a + b;
  },
  function() {
    return 42;
  },
  (x) => x * 2,
  (a, b) => a + b,
  () => {},
  function recursive(n) {
    return n = 1 ? 1 : recursive(n - 1);
  },
  function defaults(a = 1, b =32, c =3) {
    return [a, b, c];
  },
  (a, b) => a * b,
  (a, b) => a / b,
  function defaults(a = 1, b =32, c =3) {
    a = 5;
    b = 4;
    return a + b + c;
  },
];
console.log(`T3: ${T3Data.length} cases per iteration`);
benchmark(T3Data);

// tree
let curNode = {child: 'end'};
for (let i = 0; i < 50; i++) {
  curNode = {child: curNode, val: i};
}
const T4Data =[
  {
    '4': {
      '3': {
        '2': {
          '1': [1, [2, [3, {4: [[[{}]]]}]]],
        },
      },
    },
  },
  curNode,
  [],
  [1, '2', true, null, undefined],
  new Error('basic error'),
  new Array(100).fill(0).map((_, i) => i),
  new Array(100).fill(0).map((_, i) => i*i),
  new Array(100).fill(0).map((_, i) => i),
  {
    '4': {
      '3': {
        '2': {
          '1': [1, [2, [3, {4: [[[{}]]]}]]],
        },
      },
    },
  },
  [[]],
];
console.log(`T4: ${T4Data.length} cases per iteration`);
benchmark(T4Data);

