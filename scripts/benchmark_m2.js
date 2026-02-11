require('../distribution.js')();
const distribution = globalThis.distribution;

const node = {ip: '127.0.0.1', port: 9019};

distribution.node.start(() => {
  function cleanup(callback) {
    distribution.local.comm.send([], {node: node, service: 'status', method: 'stop'}, () => {
      if (globalThis.distribution.node.server) {
        globalThis.distribution.node.server.close();
      }
      callback();
    });
  };
  distribution.local.status.spawn(node, (e, v) => {
    console.log('spawned');
    const REQUESTS = 1000;
    let sent = 0;
    const start = performance.now();
    for (let i = 0; i < REQUESTS; i++) {
      distribution.local.comm.send(['sid'], {node: node, service: 'status', method: 'get'}, (e, v) => {
        sent++;
        if (sent == REQUESTS) {
          const time = performance.now() - start;
          console.log('=== COMM ===');
          console.log(`Total time: ${time.toFixed(2)} ms`);
          console.log(`Avg latency: ${(time / REQUESTS).toFixed(2)} ms/req`);
          console.log(`Throughput: ${(REQUESTS / (time / 1000)).toFixed(2)} req/sec`);
          cleanup(console.log);
        }
      });
    }
  });
});
