/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

require('../../distribution.js')();
require('../helpers/sync-guard');
const distribution = globalThis.distribution;
const id = distribution.util.id;

const mygroupGroup = {};

const n1 = {ip: '127.0.0.1', port: 7110};
const n2 = {ip: '127.0.0.1', port: 7111};
const n3 = {ip: '127.0.0.1', port: 7112};

test('(1 pts) student test', (done) => {
  // get null on a group with no objects returns empty list
  distribution.group.mem.get(null, (e, v) => {
    try {
      expect(e).toEqual({});
      expect(v).toEqual([]);
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(1 pts) student test', (done) => {
  // del same key twice in store - second del should error
  const user = {first: 'Colin', last: 'Test'};
  const key = 'colindeltest';

  distribution.group.store.put(user, key, (e, v) => {
    try {
      expect(e).toBeFalsy();
      expect(v).toEqual(user);
    } catch (error) {
      done(error);
      return;
    }
    distribution.group.store.del(key, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual(user);
      } catch (error) {
        done(error);
        return;
      }
      distribution.group.store.del(key, (e, v) => {
        try {
          expect(e).toBeTruthy();
          expect(e).toBeInstanceOf(Error);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

test('(1 pts) student test', (done) => {
  // put / get / del / get - last get should error
  const user = {first: 'Max', last: 'Smith'};
  const key = 'maxsmith';

  distribution.group.mem.put(user, key, (e, v) => {
    try {
      expect(e).toBeFalsy();
      expect(v).toEqual(user);
    } catch (error) {
      done(error);
      return;
    }
    distribution.group.mem.get(key, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual(user);
      } catch (error) {
        done(error);
        return;
      }
      distribution.group.mem.del(key, (e, v) => {
        try {
          expect(e).toBeFalsy();
          expect(v).toEqual(user);
        } catch (error) {
          done(error);
          return;
        }
        distribution.group.mem.get(key, (e, v) => {
          try {
            expect(e).toBeTruthy();
            expect(e).toBeInstanceOf(Error);
            done();
          } catch (error) {
            done(error);
          }
        });
      });
    });
  });
});

test('(1 pts) student test', (done) => {
  // put same key twice overwrites in store
  const user1 = {first: 'Loe', last: 'Original'};
  const user2 = {first: 'Loe', last: 'Updated'};
  const key = 'loeoverwrite';

  distribution.group.store.put(user1, key, (e, v) => {
    try {
      expect(e).toBeFalsy();
      expect(v).toEqual(user1);
    } catch (error) {
      done(error);
      return;
    }
    distribution.group.store.put(user2, key, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual(user2);
      } catch (error) {
        done(error);
        return;
      }
      distribution.group.store.get(key, (e, v) => {
        try {
          expect(e).toBeFalsy();
          expect(v).toEqual(user2);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

test('(1 pts) student test', (done) => {
  // get null returns all keys after multiple puts across mem
  const items = [
    {key: 'a', val: 'a'},
    {key: 'b', val: 'b'},
    {key: 'c', val: 'c'},
    {key: 'd', val: 'd'},
  ];

  let putDone = 0;
  for (const item of items) {
    distribution.group.mem.put(item.val, item.key, (e, v) => {
      if (e) {
        done(e);
        return;
      }
      putDone++;
      if (putDone === items.length) {
        distribution.group.mem.get(null, (e, v) => {
          try {
            expect(e).toEqual({});
            const expectedKeys = items.map((i) => i.key);
            expect(v).toEqual(expect.arrayContaining(expectedKeys));
            expect(v.length).toBeGreaterThanOrEqual(expectedKeys.length);
            done();
          } catch (error) {
            done(error);
          }
        });
      }
    });
  }
});

beforeAll((done) => {
  const remote = {service: 'status', method: 'stop'};

  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        startNodes();
      });
    });
  });

  mygroupGroup[id.getSID(n1)] = n1;
  mygroupGroup[id.getSID(n2)] = n2;
  mygroupGroup[id.getSID(n3)] = n3;

  function startNodes() {
    distribution.node.start((e) => {
      if (e) {
        done(e);
        return;
      }
      distribution.local.status.spawn(n1, (e, v) => {
        if (e) {
          done(e);
          return;
        }
        distribution.local.status.spawn(n2, (e, v) => {
          if (e) {
            done(e);
            return;
          }
          distribution.local.status.spawn(n3, (e, v) => {
            if (e) {
              done(e);
              return;
            }
            groupInstantiation();
          });
        });
      });
    });
  }

  function groupInstantiation() {
    const config = {gid: 'group'};
    distribution.local.groups.put(config, mygroupGroup, (e, v) => {
      if (e && Object.keys(e).length > 0) {
        done(e);
        return;
      }
      distribution.group.groups.put(config, mygroupGroup, (e, v) => {
        if (e && Object.keys(e).length > 0) {
          done(e);
          return;
        }
        done();
      });
    });
  }
});

afterAll((done) => {
  const remote = {service: 'status', method: 'stop'};
  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        if (globalThis.distribution.node.server) {
          globalThis.distribution.node.server.close();
        }
        done();
      });
    });
  });
});
