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


test('(1 pts) nested empty arrays and objects', () => {
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
});


test('(1 pts) test nested errors', () => {
  const inner = new Error('root');
  const outer = new Error('outside', {cause: inner});
  const serialized = distribution.util.serialize(outer);
  const deserialized = distribution.util.deserialize(serialized);
  expect(deserialized.message).toBe('outside');
  expect(deserialized.cause.message).toBe('root');
});

test('(1 pts) detects not serializable', () => {
  const malformedSerializedString = '{"type":"object","value":{1:{"type":"number","value":"1"},"b":{"type":"string","value":"two"},"c":{"type":"boolean","value":"false"}}}';
  expect(() => {
    distribution.util.deserialize(malformedSerializedString);
  }).toThrow(Error);
});

test('(1 pts) test nan and more types', () => {
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
});
