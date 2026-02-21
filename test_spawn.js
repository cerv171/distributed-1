const distribution = require('./distribution.js')();
distribution.node.start(() =>{
  const start = Date.now();
  let end;
  const iter = 100;
  let spawned = 0;
  for (let i = 0; i < iter; i++) {
    const node = {ip: '127.0.0.1', port: 8080+i};
    distribution.local.status.spawn(node, () => {
      spawned++;
      if (spawned == iter) {
        end = Date.now();
        console.log(`took ${end-start} ms`);
      }
    });
  }
});
