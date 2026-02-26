const distribution = require('./distribution.js')();
const nids = [
  distribution.util.id.getNID({ip: '192.168.0.1', port: 8000}),
  distribution.util.id.getNID({ip: '192.168.0.2', port: 8000}),
  distribution.util.id.getNID({ip: '192.168.0.3', port: 8000}),
  distribution.util.id.getNID({ip: '192.168.0.4', port: 8000}),
  distribution.util.id.getNID({ip: '192.168.0.5', port: 8000}),
];

distribution.node.start((e, v) => {
  const keys = ['abc', 'def', '4', 'c'];
  for (const key of keys) {
    console.log(key);
    console.log(distribution.util.id.consistentHash(key, nids));
    console.log(distribution.util.id.rendezvousHash(key, nids));
  }
});
