/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const distribution = require('../../distribution.js')();
require('../helpers/sync-guard');

test('(1 pts) simple test all types', () => {
  const object = {
    loe: new Date(),
    numb: 1,
    numb2: Infinity,
    arr: [1],
    error: Error('bad'),
    object: {s: 's'},
    boolean: true,
    nul: null,
    undef: undefined,
    str: 'string',
  };
  const serialized = distribution.util.serialize(object);
  const deserialized = distribution.util.deserialize(serialized);
  expect(deserialized).toEqual(object);
});


test('(1 pts) nested arrays and objects', () => {
  const object = {
    '4': {
      '3': {
        '2': {
          '1': [1, [2, [3, {4: [[[{}]]]}]]],
        },
      },
    },
  };
  const serialized = distribution.util.serialize(object);
  const deserialized = distribution.util.deserialize(serialized);
  expect(deserialized).toEqual(object);

  let curNode = {child: 'end'};
  for (let i = 0; i < 50; i++) {
    curNode = {child: curNode, val: i};
  }
  expect(distribution.util.deserialize(distribution.util.serialize(curNode))).toEqual(curNode);
});


test('(1 pts) test nested errors', () => {
  const inner = new Error('root');
  const outer = new Error('outside', {cause: inner});
  const serialized = distribution.util.serialize(outer);
  const deserialized = distribution.util.deserialize(serialized);
  expect(deserialized.message).toBe('outside');
  expect(deserialized.cause.message).toBe('root');
});

test('(1 pts) handles various types of functions', () => {
  const object = [
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
  ];
  const serialized = distribution.util.serialize(object);
  const deserialized = distribution.util.deserialize(serialized);
  //test function behavior
  expect(deserialized[0](2, 3)).toBe(5);
  expect(deserialized[1]()).toBe(42);
  expect(deserialized[2](4)).toBe(8);
  expect(deserialized[3](10, 20)).toBe(object[3](10, 20));
  expect(deserialized[4]()).toBe(undefined);
  expect(deserialized[5](5)).toBe(object[5](5));
});

test('(1 pts) test nan and not  serializable', () => {
  const object = {
    'hello': 'world',
    'missing': undefined,
    'err': new Error('missing'),
    'one': 1,
    'nan': 2.0 / 0.0,
  };
  const serialized = distribution.util.serialize(object);
  const deserialized = distribution.util.deserialize(serialized);
  expect(deserialized).toEqual(object);

  const malformedSerializedString = '{"type":"object","value":{1:{"type":"number","value":"1"},"b":{"type":"string","value":"two"},"c":{"type":"boolean","value":"false"}}}';
  expect(() => {
    distribution.util.deserialize(malformedSerializedString);
  }).toThrow(Error);
});

