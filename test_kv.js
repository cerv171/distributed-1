require('./distribution.js')();
const distribution = globalThis.distribution;
const id = distribution.util.id;
const crypto = require('crypto');

const n1 = {ip: '3.145.82.137', port: 8080};
const n2 = {ip: '18.118.255.73', port: 8080};
const n3 = {ip: '3.148.248.127', port: 8080};

const randomObjects = [];
for (let i = 0; i < 1000; i++) {
  const key = crypto.randomBytes(8).toString('hex');
  randomObjects.push({key: key, value: key});
}

const group = {};
group[id.getSID(n1)] = n1;
group[id.getSID(n2)] = n2;
group[id.getSID(n3)] = n3;

distribution.local.groups.put({gid: 'benchgroup'}, group, (e, v) => {
  distribution.benchgroup.groups.put({gid: 'benchgroup'}, group, (e, v) => {
    console.log('Group created with 3 nodes\n');
    put();
  });
});

function printStats(label, latencies, totalTime) {
  latencies.sort((a, b) => a - b);
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const throughput = (latencies.length / totalTime) * 1000;

  console.log(`\n--- ${label} Results ---`);
  console.log(`Total time: ${totalTime} ms`);
  console.log(`Throughput: ${throughput.toFixed(2)} objs/sec`);
  console.log(`Avg latency: ${avg.toFixed(2)} ms/obj`);
}

function put() {
  console.log('Inserting 1000 objects...');
  const latencies = [];
  let done = 0;
  const totalStart = Date.now();

  for (let i = 0; i < randomObjects.length; i++) {
    const opStart = Date.now();
    distribution.benchgroup.store.put(randomObjects[i].value, randomObjects[i].key, (e, v) => {
      latencies.push(Date.now() - opStart);
      if (e) console.log(e);
      done++;
      if (done === randomObjects.length) {
        printStats('PUT', latencies, Date.now() - totalStart);
        get();
      }
    });
  }
}

function get() {
  console.log('\nGetting 1000 objects...');
  const latencies = [];
  let done = 0;
  const totalStart = Date.now();

  for (let i = 0; i < randomObjects.length; i++) {
    const opStart = Date.now();
    distribution.benchgroup.store.get(randomObjects[i].key, (e, v) => {
      latencies.push(Date.now() - opStart);
      if (e) console.log(e);
      done++;
      if (done === randomObjects.length) {
        printStats('GET', latencies, Date.now() - totalStart);
      }
    });
  }
}
