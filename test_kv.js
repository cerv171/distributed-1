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
};

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

function put() {
  console.log('Inserting 1000 objets...');
  const start = Date.now();
  let done = 0;
  for (let i = 0; i < randomObjects.length; i++) {
    distribution.benchgroup.store.put(randomObjects[i].value, randomObjects[i].key, (e, v) => {
      done++;
      if (done == randomObjects.length) {
        const end = Date.now();
        const totalTime = end - start;
        console.log(`Put throughput: ${randomObjects.length / totalTime * 1000}`);
        console.log(`Put latency: ${totalTime / randomObjects.length * 1000}`);
        get();
      }
    });
  }
};

function get() {
  console.log('Getting 1000 objects');
  const start = Date.now();
  let done = 0;
  for (let i = 0; i < randomObjects.length; i++) {
    distribution.benchgroup.store.get(randomObjects[i].key, (e, v) => {
      done++;
      if (done == randomObjects.length) {
        const end = Date.now();
        const totalTime = end - start;
        console.log(`Get throughput: ${randomObjects.length / totalTime * 1000}`);
        console.log(`Get latency: ${totalTime / randomObjects.length * 1000}`);
      }
    });
  }
}
