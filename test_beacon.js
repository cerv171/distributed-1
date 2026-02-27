require('./distribution.js')();
const distribution = globalThis.distribution;
const id = distribution.util.id;

const n1 = {ip: '127.0.0.1', port: 9001};
const n2 = {ip: '127.0.0.1', port: 9002};
const n3 = {ip: '127.0.0.1', port: 9003};

const remote = {service: 'status', method: 'stop'};
remote.node = n1;
distribution.local.comm.send([], remote, () => {
  remote.node = n2;
  distribution.local.comm.send([], remote, () => {
    remote.node = n3;
    distribution.local.comm.send([], remote, () => {
      start();
    });
  });
});

function logPlacement(label, keys, nodes) {
  console.log(`\n--- ${label} ---`);
  const nids = nodes.map(n => id.getNID(n));
  for (const key of keys) {
    const kid = id.getID(key);
    const nid = id.naiveHash(kid, nids);
    const node = nodes.find(n => id.getNID(n) === nid);
    console.log(`  ${key} -> port ${node.port} (nid: ${nid.substring(0, 8)}...)`);
  }
}

function checkKeys(label, keys, callback) {
  console.log(`\n--- ${label} ---`);
  let done = 0;
  for (const key of keys) {
    distribution.testgroup.mem.get(key, (e, v) => {
      if (e) {
        console.log(`  get ${key}: ERROR - ${e.message}`);
      } else {
        console.log(`  get ${key}: ${JSON.stringify(v)}`);
      }
      done++;
      if (done === keys.length) callback();
    });
  }
}

function start() {
  distribution.node.start(() => {
    distribution.local.status.spawn(n1, () => {
      distribution.local.status.spawn(n2, () => {
        distribution.local.status.spawn(n3, () => {
          setup();
        });
      });
    });
  });
}

function setup() {
  const group = {};
  group[id.getSID(n1)] = n1;
  group[id.getSID(n2)] = n2;
  group[id.getSID(n3)] = n3;

  const config = {gid: 'testgroup'};
  distribution.local.groups.put(config, group, (e, v) => {
    console.log('group created:', Object.keys(v).length, 'nodes');

    const keys = ['alice', 'bob', 'charlie', 'dave', 'eve'];

    // Show expected placement with all 3 nodes
    logPlacement('Expected placement (3 nodes)', keys, [n1, n2, n3]);

    // Show expected placement after removing n3
    logPlacement('Expected placement (2 nodes, no n3)', keys, [n1, n2]);

    // Put all items
    let putDone = 0;
    for (const key of keys) {
      distribution.testgroup.mem.put({name: key}, key, (e, v) => {
        if (e) console.log(`  put ${key} ERROR:`, e.message);
        putDone++;
        if (putDone === keys.length) afterPuts();
      });
    }

    function afterPuts() {
      // Verify all keys exist before removal
      checkKeys('Before removal - get all keys', keys, () => {
        console.log('\n--- Removing n3 ---');
        const oldGroup = {...group};

        distribution.local.groups.rem('testgroup', id.getSID(n3), (e, v) => {
          console.log('removed n3, now', Object.keys(v).length, 'nodes');
          console.log('waiting for beacon (7s)...');

          setTimeout(() => {
            // Check all keys after beacon fires
            checkKeys('After beacon reconf - get all keys', keys, () => {
              // Also verify by directly querying each remaining node
              console.log('\n--- Direct node queries ---');
              let queryDone = 0;
              const totalQueries = keys.length * 2;
              for (const key of keys) {
                for (const node of [n1, n2]) {
                  const msg = [{key: key, gid: 'testgroup'}];
                  const r = {node: node, service: 'mem', method: 'get'};
                  distribution.local.comm.send(msg, r, (e, v) => {
                    if (!e) {
                      console.log(`  ${key} found on port ${node.port}: ${JSON.stringify(v)}`);
                    }
                    queryDone++;
                    if (queryDone === totalQueries) cleanup();
                  });
                }
              }
            });
          }, 7000);
        });
      });
    }
  });
}

function cleanup() {
  console.log('\ncleaning up...');
  const r = {service: 'status', method: 'stop'};
  r.node = n1;
  distribution.local.comm.send([], r, () => {
    r.node = n2;
    distribution.local.comm.send([], r, () => {
      r.node = n3;
      distribution.local.comm.send([], r, () => {
        distribution.node.server.close();
        console.log('done');
      });
    });
  });
}