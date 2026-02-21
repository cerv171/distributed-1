const distribution = require('./distribution.js')();
const log = distribution.util.log;
log('starting log');
let start;
let end;
distribution.node.start(() => {
  const NODE_COUNT = 10;
  const allNodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    allNodes.push({ip: '127.0.0.1', port: 8080+i});
  }
  let spawned = 0;
  const id = distribution.util.id;
  const groupData = Object.fromEntries(allNodes.map((node) => [id.getSID(node), node]));
  groupData[id.getSID(distribution.node.config)] = distribution.node.config;
  const groupConfig = {
    gid: 'testGroup',
    subset: (lst) => Math.ceil(Math.log(lst.length)),
  };
  for (const node of allNodes) {
    distribution.local.status.spawn(node, (e, v) => {
      // console.log('spawn error');
      // console.log(e);
      spawned++;
      if (spawned == NODE_COUNT) {
        let n = 0;
        const counterService = {
          count: (callback) => {
            n++;
            if (n >= NODE_COUNT) {
              end = Date.now();
              console.log(`took ${(end - start)} ms`);
            }
            return callback(null, n);
          },
        };
        distribution.local.routes.put(counterService, 'counter', (e, v) => {
          distribution.local.groups.put(groupConfig, groupData, (e, v) => {
            distribution.testGroup.groups.put(groupConfig, groupData, (e, v) => {
              start = Date.now();
              const message = [[], {node: distribution.node.config, service: 'counter', method: 'count'}];
              const remote = {service: 'comm', method: 'send'};
              distribution.testGroup.gossip.send(message, remote, (e, v) => {
                console.log(v);
              });
              setTimeout(() => {
                console.log(`reached: ${n} / ${NODE_COUNT} nodes`);
              }, 5000);
            });
          });
        });
      }
    });
  }
});
