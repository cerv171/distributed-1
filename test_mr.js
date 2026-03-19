globalThis.debug = true;
require('./distribution.js')();
const distribution = globalThis.distribution;
console.log('starting');
const id = distribution.util.id;
const ncdcGroup = {};
const n1 = {ip: '127.0.0.1', port: 7110};
const n2 = {ip: '127.0.0.1', port: 7111};
const n3 = {ip: '127.0.0.1', port: 7112};
ncdcGroup[id.getSID(n1)] = n1;
ncdcGroup[id.getSID(n2)] = n2;
ncdcGroup[id.getSID(n3)] = n3;
const log = distribution.util.log;
log('starting log');
const startNodes = (cb) => {
  console.log('starting nodes');
  distribution.local.status.spawn(n1, (e, v) => {
    console.log('one node spawned');
    if (e) {
      console.log(e);
    }
    distribution.local.status.spawn(n2, (e, v) => {
      distribution.local.status.spawn(n3, (e, v) => {
        console.log('nodes started');
        cb();
      });
    });
  });
};
const ncdcConfig = {'gid': 'ncdc'};
distribution.node.start((e, v) => {
  console.log('server started');
  startNodes(() => {
    distribution.local.groups.put(ncdcConfig, ncdcGroup, (e, v) => {
      distribution.ncdc.groups.put(ncdcConfig, ncdcGroup, (e, v) => {
        const mapper = (key, value) => {
          const words = value.split(/(\s+)/).filter((e) => e !== ' ');
          const out = {};
          out[words[1]] = parseInt(words[3]);
          return out;
        };

        const reducer = (key, values) => {
          const out = {};
          out[key] = values.reduce((a, b) => Math.max(a, b), -Infinity);
          return out;
        };

        const dataset = [
          {'000': '006701199099999 1950 0515070049999999N9 +0000 1+9999'},
          {'106': '004301199099999 1950 0515120049999999N9 +0022 1+9999'},
          {'212': '004301199099999 1950 0515180049999999N9 -0011 1+9999'},
          {'318': '004301265099999 1949 0324120040500001N9 +0111 1+9999'},
          {'424': '004301265099999 1949 0324180040500001N9 +0078 1+9999'},
        ];

        const expected = [{'1950': 22}, {'1949': 111}];

        const doMapReduce = () => {
          distribution.ncdc.store.get(null, (e, v) => {
            const start = Date.now();
            distribution.ncdc.mr.exec({keys: v, map: mapper, reduce: reducer}, (e, v) => {
              try {
                console.log('final value', v);
                const elapsed = Date.now() - start;
                console.log(elapsed);
              } catch (e) {

              }
            });
          });
        };

        let cntr = 0;
        // Send the dataset to the cluster
        dataset.forEach((o) => {
          const key = Object.keys(o)[0];
          const value = o[key];
          distribution.ncdc.store.put(value, key, (e, v) => {
            cntr++;
            if (cntr === dataset.length) {
              doMapReduce();
            }
          });
        });
      });
    });
  });
});
