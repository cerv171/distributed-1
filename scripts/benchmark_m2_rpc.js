require('../distribution.js')();
const distribution = globalThis.distribution;
let n = 0;
const addOne = () => {
  return ++n;
};

const addOneRPC = globalThis.distribution.util.wire.createRPC(globalThis.distribution.util.wire.toAsync(addOne));
const rpcService = {
  addOne: addOneRPC,
};
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

  // Spawn the remote node.
  console.log('spawning remote');
  distribution.local.status.spawn(node, (e, v) => {
    // Install the addOne service on the remote node with the name 'addOneService'.
    distribution.local.comm.send([rpcService, 'addOneService'], {node: node, service: 'routes', method: 'put'}, (e, v) => {
      const REQUESTS = 1000;
      let sent = 0;
      const start = performance.now();
      for (let i =0; i < REQUESTS; i++) {
        distribution.local.comm.send([], {node: node, service: 'addOneService', method: 'addOne'}, (e, v) => {
          sent++;
          if (sent == REQUESTS) {
            const time = performance.now() - start;
            console.log('=== RPC ===');
            console.log(`Total time: ${time.toFixed(2)} ms`);
            console.log(`Avg latency: ${(time / REQUESTS).toFixed(2)} ms/req`);
            console.log(`Throughput: ${(REQUESTS / (time / 1000)).toFixed(2)} req/sec`);
            cleanup(console.log);
          }
        });
      };
    });
  });
});
