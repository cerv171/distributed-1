/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const distribution = require('../../distribution.js')();
const local = distribution.local;
require('../helpers/sync-guard');
test('(1 pts) student test put, get, rem, rem should err', (done) => {
  const myService = {greet: (name, cb) => cb(null, `hello ${name}`)};
  local.routes.put(myService, 'greetService', (putErr, putVal) => {
    expect(putErr).toBeFalsy();
    expect(putVal).toEqual('greetService');
    local.routes.get('greetService', (getErr, getVal) => {
      expect(getErr).toBeFalsy();
      expect(getVal).toBe(myService);
      local.routes.rem('greetService', (remErr, remVal) => {
        expect(remErr).toBeFalsy();
        expect(remVal).toBe(myService);
        local.routes.rem('greetService', (remAgainErr, remAgainVal) => {
          expect(remAgainErr).toBeInstanceOf(Error);
          expect(remAgainVal).toBeFalsy();
          done();
        });
      });
    });
  });
});


test('(1 pts) student test calling appropriate functions with no arguments returns an error', (done) => {
  const node = distribution.node.config;
  const remote = {node: node, service: 'status', method: 'get'};
  local.comm.send([], remote, (err, val) => {
    expect(err).toBeInstanceOf(Error);
    done();
  });
  const remote2 = {node: node, service: 'routes', method: 'rem'};
  local.comm.send([], remote2, (err, val) => {
    expect(err).toBeInstanceOf(Error);
    done();
  });
});


test('(1 pts) student test comm send with no callback does not return error', (done) => {
  const node = distribution.node.config;
  const remote = {node: node, service: 'status', method: 'get'};
  local.comm.send(['nid'], remote);
  done();
});

test('(1 pts) student test comm put service then call it', (done) => {
  const node = distribution.node.config;
  const addService = {
    add: (a, b, cb) => cb(null, a + b),
  };
  local.comm.send([addService, 'addService'],
      {node: node, service: 'routes', method: 'put'}, (putErr, putVal) => {
        expect(putErr).toBeFalsy();
        expect(putVal).toEqual('addService');
        local.comm.send([6, 7],
            {node: node, service: 'addService', method: 'add'}, (addErr, addVal) => {
              expect(addErr).toBeFalsy();
              expect(addVal).toEqual(13);
              done();
            });
      });
});

test('(1 pts) student test routes put overwrites existing service', (done) => {
  const node = distribution.node.config;
  const s1 = {do: (cb) => cb(null, 'first')};
  const s2 = {do: (cb) => cb(null, 'second')};
  local.comm.send([s1, 'overwriteTest'],
      {node: node, service: 'routes', method: 'put'}, (putErr1, _) => {
        expect(putErr1).toBeFalsy();
        local.comm.send([s2, 'overwriteTest'],
            {node: node, service: 'routes', method: 'put'}, (putErr2, _) => {
              expect(putErr2).toBeFalsy();
              local.comm.send([],
                  {node: node, service: 'overwriteTest', method: 'do'}, (callErr, callVal) => {
                    expect(callErr).toBeFalsy();
                    expect(callVal).toEqual('second');
                    done();
                  });
            });
      });
});

beforeAll((done) => {
  distribution.node.start((e) => {
    if (e) {
      done(e);
      return;
    }
    done();
  });
});

afterAll((done) => {
  if (globalThis.distribution.node.server) {
    globalThis.distribution.node.server.close();
  }
  done();
});
