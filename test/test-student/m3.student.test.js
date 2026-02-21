//ts-check
/**
 * @typedef {Object} Remote
 * @property {Node} node
 * @property {string} service
 * @property {string} method

 * @typedef {Object} Payload
 * @property {Remote} remote
 * @property {any} message
 * @property {string} mid
 * @property {string} gid
 */
/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const { isExportDeclaration } = require('typescript');

const distribution = require('../../distribution.js')();
require('../helpers/sync-guard');
const NODE_COUNT = 10;
const allNodes = [];
for (let i = 0; i < NODE_COUNT; i++) {
  allNodes.push({ip: '127.0.0.1', port: 8000+i});
}

const id = distribution.util.id;

const groupData = Object.fromEntries(allNodes.map((node) => [distribution.util.id.getSID(node), node]));
const groupConfig = {
  gid: 'testGroup',
  subset: (lst) => 10,
};
test('(1 pts) student test', (done) => { // basic full groups functionality
  distribution.local.groups.put(groupConfig, groupData, (e, v) => {
    try {
      expect(e).toBeFalsy();
      expect(v).toEqual(groupData);
    } catch (err) {
      done(err);
      return;
    }
    distribution.local.groups.get('testGroup', (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual(groupData);
      } catch (err) {
        done(err);
        return;
      }
      distribution.local.groups.del('testGroup', (e, v) => {
        try {
          expect(e).toBeFalsy();
        } catch (err) {
          done(err);
          return;
        }
        distribution.local.groups.get('testGroup', (e, v) => {
          try {
            expect(e).toBeInstanceOf(Error);
            done();
          } catch (err) {
            done(err);
          }
        });
      });
    });
  });
});


test('(1 pts) student test', (done) => {
  const subset = allNodes.slice(0, 4);
  const group = Object.fromEntries(subset.map((n) => [id.getSID(n), n]));

  distribution.local.groups.put({gid: 'testProp'}, group, (e, v) => {
    const newGroup = Object.fromEntries(subset.slice(0, 2).map((n) => [id.getSID(n), n]));
    distribution.testProp.groups.put('inner', newGroup, (e, v) => {
      try {
        expect(Object.keys(e).length).toBe(0);
      } catch (err) {
        done(err); return;
      }
      distribution.testProp.groups.get('inner', (e, v) => {
        try {
          for (const sid of Object.keys(group)) {
            expect(v[sid]).toBeDefined();
            expect(Object.keys(v[sid])).toEqual(expect.arrayContaining(Object.keys(newGroup)));
          }
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });
});


test('(1 pts) student test', (done) => { // gossip test basic functionality
  let n = 0;
  const counterService = {
    count: (callback) => {
      n++;
      callback(null, n);
    },
  };

  const gossipGroup = Object.fromEntries(allNodes.map((node) => [id.getSID(node), node]));
  gossipGroup[id.getSID(distribution.node.config)] = distribution.node.config;
  const gossipConfig = {
    gid: 'gossipTest',
    subset: (lst) => Math.ceil(Math.log(lst.length) * 2),
  };
  const message = [[], {node: distribution.node.config, service: 'counter', method: 'count'}];
  const remote = {service: 'comm', method: 'send'};

  distribution.local.routes.put(counterService, 'counter', (e, v) => {
    distribution.local.groups.put(gossipConfig, gossipGroup, (e, v) => {
      distribution.gossipTest.groups.put(gossipConfig, gossipGroup, (e, v) => {
        distribution.gossipTest.gossip.send(message, remote, (e, v) => {});
        setTimeout(() => {
          try {
            expect(n).toBeGreaterThanOrEqual(NODE_COUNT - 1);
            done();
          } catch (err) {
            done(err);
          }
        }, 3000);
      });
    });
  });
});

test('(1 pts) student test', (done) => { // gossip more functionality, groups with different views of group should handle as expected
  let n = 0;
  const counterService = {
    count: (callback) => {
      n++;
      callback(null, n);
    },
  };

  const gossipGroup = Object.fromEntries(allNodes.map((node) => [id.getSID(node), node]));
  const gossipGroupSeparate = Object.fromEntries(allNodes.slice(0, 5).map((node) => [id.getSID(node), node]));
  gossipGroup[id.getSID(distribution.node.config)] = distribution.node.config;
  const gossipConfig = {
    gid: 'gossipTest',
    subset: (lst) => Math.ceil(Math.log(lst.length) * 2),
  };
  const gossipConfigSeparate = {
    gid: 'gossipTestSep',
    subset: (lst) => Math.ceil(Math.log(lst.length) * 2),
  };
  const message = [[], {node: distribution.node.config, service: 'counter', method: 'count'}];
  const remote = {service: 'comm', method: 'send'};
  distribution.local.routes.put(counterService, 'counter', (e, v) => {
    distribution.local.groups.put(gossipConfig, gossipGroup, (e, v) => {
      distribution.local.groups.put(gossipConfigSeparate, gossipGroupSeparate, (e, v) => {
        distribution.gossipTest.groups.put(gossipConfig, gossipGroup, (e, v) => {
          distribution.gossipTestSep.groups.put(gossipConfig, gossipGroupSeparate, (e, v) => {
            distribution.gossipTestSep.gossip.send(message, remote, (e, v) => {});
            setTimeout(() => {
              try {
                expect(n).toBeLessThan(NODE_COUNT - 1);
                done();
              } catch (err) {
                done(err);
              }
            }, 3000);
          });
        });
      });
    });
  });
});

test('(1 pts) student test', (done) => { // gossip recv errors when gid not registered
  const mid = 66;
  const payload = {
    message: [],
    remote: {node: distribution.node.config, service: 'status', method: 'get'},
    mid: mid,
    gid: 'nonexistentGroup',
  };

  distribution.local.gossip.recv(payload, (e, v) => {
    expect(e).toBeInstanceOf(Error);
    done();
  });
});

function startAllNodes(callback) {
  distribution.node.start(() => {
    function startStep(step) {
      if (step >= allNodes.length) {
        callback();
        return;
      }

      distribution.local.status.spawn(allNodes[step], (e, v) => {
        if (e) {
          return callback(e);
        }
        startStep(step + 1);
      });
    }
    startStep(0);
  });
}


function stopAllNodes(callback) {
  const remote = {method: 'stop', service: 'status'};

  function stopStep(step) {
    if (step == allNodes.length) {
      callback();
      return;
    }

    if (step < allNodes.length) {
      remote.node = allNodes[step];
      distribution.local.comm.send([], remote, (e, v) => {
        stopStep(step + 1);
      });
    }
  }

  if (globalThis.distribution.node.server) {
    globalThis.distribution.node.server.close();
  }
  stopStep(0);
}

beforeAll((done) => {
  // Stop any leftover nodes
  stopAllNodes(() => {
    startAllNodes(done);
  });
});

afterAll((done) => {
  stopAllNodes(done);
});
