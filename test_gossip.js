const distribution = require('./distribution.js')();
const log = distribution.util.log;
log('starting log');
distribution.node.start(() => {
  const NODE_COUNT = 100;
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
    subset: (lst) => Math.ceil(Math.log(100) * 2),
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
            console.log(`counter service n: ${n}`);
            callback(n);
          },
        };
        const payload = {message: [], remote: {node: distribution.node.config, service: 'counter', method: 'count'}, mid: [1], gid: 'testGroup'};
        const remote = {service: 'gossip', method: 'recv'};
        distribution.local.routes.put(counterService, 'counter', (e, v) => {
          distribution.local.groups.put(groupConfig, groupData, (e, v) => {
            distribution.testGroup.groups.put(groupConfig, groupData, (e, v) => {
              console.log('groups.put errors:', e);
              distribution.testGroup.gossip.send(payload, remote, (e, v) => {
                console.log(v);
              });
              setTimeout(() => {
                console.log(`reached: ${n} nodes`);
              }, 3000);
            });
          });
        });
      }
    });
  }
});
