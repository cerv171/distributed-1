/*
    In this file, add your own test case that will confirm your correct implementation of the extra-credit functionality.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

require('../../distribution.js')();
require('../helpers/sync-guard');
const distribution = globalThis.distribution;
const id = distribution.util.id;

const beaconGroup = {};

const n1 = {ip: '127.0.0.1', port: 9000};
const n2 = {ip: '127.0.0.1', port: 9001};
const n3 = {ip: '127.0.0.1', port: 9002};
const n4 = {ip: '127.0.0.1', port: 9003};
const n5 = {ip: '127.0.0.1', port: 9004};

test('(15 pts) detect the need to reconfigure', (done) => {
  const keys = ['loe', 'max', 'charlie', 'colin', 'e'];
  const users = keys.map((k) => ({name: k}));

  const remainingNodes = [n1, n2, n3, n4];
  const remainingNids = remainingNodes.map((n) => id.getNID(n));
  const nidToNode = {};
  nidToNode[id.getNID(n1)] = n1;
  nidToNode[id.getNID(n2)] = n2;
  nidToNode[id.getNID(n3)] = n3;
  nidToNode[id.getNID(n4)] = n4;

  let putDone = 0;
  for (let i = 0; i < keys.length; i++) {
    distribution.beacongroup.mem.put(users[i], keys[i], (e, v) => {
      if (e) {
        done(e);
        return;
      }
      putDone++;
      if (putDone === keys.length) {
        removeNode();
      }
    });
  }

  function removeNode() {
    // Remove n5 from group
    distribution.local.groups.rem('beacongroup', id.getSID(n5), (e, v) => {
      distribution.beacongroup.groups.rem('beacongroup', id.getSID(n5), (e, v) => {
        setTimeout(() => {
          checkReconfigured();
        }, 2000);
      });
    });
  }

  function checkReconfigured() {
    let checkDone = 0;
    for (let i = 0; i < keys.length; i++) {
      distribution.beacongroup.mem.get(keys[i], (e, v) => {
        try {
          expect(e).toBeFalsy();
          expect(v).toEqual(users[i]);
        } catch (error) {
          done(error);
          return;
        }
        checkDone++;
        if (checkDone === keys.length) {
          verifyExpected();
        }
      });
    }
  }

  function verifyExpected() {
    let verified = 0;
    for (let i = 0; i < keys.length; i++) {
      const kid = id.getID(keys[i]);
      const expectedNid = id.naiveHash(kid, remainingNids);
      const expectedNode = nidToNode[expectedNid];

      const msg = [{key: keys[i], gid: 'beacongroup'}];
      const remote = {node: expectedNode, service: 'mem', method: 'get'};
      distribution.local.comm.send(msg, remote, (e, v) => {
        try {
          expect(e).toBeFalsy();
          expect(v).toEqual(users[i]);
        } catch (error) {
          done(error);
          return;
        }
        verified++;
        if (verified === keys.length) {
          done();
        }
      });
    }
  }
}, 2500);

beforeAll((done) => {
  const remote = {service: 'status', method: 'stop'};

  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        remote.node = n4;
        distribution.local.comm.send([], remote, (e, v) => {
          remote.node = n5;
          distribution.local.comm.send([], remote, (e, v) => {
            startNodes();
          });
        });
      });
    });
  });

  beaconGroup[id.getSID(n1)] = n1;
  beaconGroup[id.getSID(n2)] = n2;
  beaconGroup[id.getSID(n3)] = n3;
  beaconGroup[id.getSID(n4)] = n4;
  beaconGroup[id.getSID(n5)] = n5;

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
            distribution.local.status.spawn(n4, (e, v) => {
              if (e) {
                done(e);
                return;
              }
              distribution.local.status.spawn(n5, (e, v) => {
                if (e) {
                  done(e);
                  return;
                }
                groupInstantiation();
              });
            });
          });
        });
      });
    });
  }

  function groupInstantiation() {
    const beaconConfig = {gid: 'beacongroup'};
    distribution.local.groups.put(beaconConfig, beaconGroup, (e, v) => {
      if (e && Object.keys(e).length > 0) {
        done(e);
        return;
      }
      distribution.beacongroup.groups.put(beaconConfig, beaconGroup, (e, v) => {
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
        remote.node = n4;
        distribution.local.comm.send([], remote, (e, v) => {
          remote.node = n5;
          distribution.local.comm.send([], remote, (e, v) => {
            if (globalThis.distribution.node.server) {
              globalThis.distribution.node.server.close();
            }
            done();
          });
        });
      });
    });
  });
});
