/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

require('../../distribution.js')();
require('../helpers/sync-guard');
const distribution = globalThis.distribution;
const id = distribution.util.id;
const ncdcGroup = {};
const n1 = {ip: '127.0.0.1', port: 8000};
const n2 = {ip: '127.0.0.1', port: 8001};
const n3 = {ip: '127.0.0.1', port: 8002};

function clearStore(gid, done) {
  distribution[gid].store.get(null, (e, keys) => {
    if (!keys || keys.length === 0) return done();
    let count = 0;
    keys.forEach((key) => {
      distribution[gid].store.del(key, (e, v) => {
        count++;
        if (count === keys.length) done();
      });
    });
  });
}

test('(1 pts) student test', (done) => {
  clearStore('ncdc', () => {
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
        try {
          expect(v.length).toEqual(dataset.length);
        } catch (e) {
          done(e);
        }

        console.log('running exec');
        distribution.ncdc.mr.exec({keys: v, map: mapper, reduce: reducer}, (e, v) => {
          console.log(e, v);
          try {
            console.log('got exex output');
            expect(v).toEqual(expect.arrayContaining(expected));
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    };

    let cntr = 0;
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


test('(1 pts) student test', (done) => {
  clearStore('ncdc', () => {
    const mapper = (key, value) => {
      const chars = value.split(',');
      return chars.map((c) => {
        const o = {};
        o[c] = 1;
        return o;
      });
    };

    const reducer = (key, values) => {
      const out = {};
      out[key] = values.reduce((a, b) => a + b, 0);
      return out;
    };

    const dataset = [
      {'r1': 'a,b,a'},
      {'r2': 'b,c,b'},
      {'r3': 'a,c,c'},
    ];

    const expected = [{'a': 3}, {'b': 3}, {'c': 3}];

    let cntr = 0;
    dataset.forEach((o) => {
      const key = Object.keys(o)[0];
      distribution.ncdc.store.put(o[key], key, (e, v) => {
        cntr++;
        if (cntr === dataset.length) {
          distribution.ncdc.store.get(null, (e, v) => {
            console.log('running exec');
            distribution.ncdc.mr.exec({keys: v, map: mapper, reduce: reducer}, (e, v) => {
              try {
                console.log('got output');
                expect(v).toEqual(expect.arrayContaining(expected));
                expect(v.length).toBe(3);
                done();
              } catch (e) {
                done(e);
              }
            });
          });
        }
      });
    });
  });
});


test('(1 pts) student test', (done) => {
  clearStore('ncdc', ()=> {
    const mapper = (key, value) => {
      return {[value]: 1};
    };

    const reducer = (key, values) => {
      return {[key]: values.reduce((a, b) => a + b, 0)};
    };

    distribution.ncdc.mr.exec({keys: [], map: mapper, reduce: reducer}, (e, v) => {
      try {
        expect(v).toEqual([]);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});

test('(1 pts) student test', (done) => {
  clearStore('ncdc', () => {
    const mapper = (key, value) => {
      const words = value.split(/\s+/);
      return words.map((w) => {
        const o = {};
        o[w] = 1;
        return o;
      });
    };

    const reducer = (key, values) => {
      const out = {};
      out[key] = values.reduce((a, b) => a + b, 0);
      return out;
    };

    const dataset = [
      {'d1': 'leo is a golden retriever who loves the park'},
      {'d2': 'max is a husky who loves treats and naps'},
      {'d3': 'leo and max are best friends at the park'},
    ];

    const expected = [
      {'leo': 2}, {'is': 2}, {'a': 2}, {'golden': 1}, {'retriever': 1},
      {'who': 2}, {'loves': 2}, {'the': 2}, {'park': 2}, {'max': 2},
      {'husky': 1}, {'treats': 1}, {'and': 2}, {'naps': 1},
      {'are': 1}, {'best': 1}, {'friends': 1}, {'at': 1},
    ];

    let cntr = 0;
    dataset.forEach((o) => {
      const key = Object.keys(o)[0];
      distribution.ncdc.store.put(o[key], key, (e, v) => {
        cntr++;
        if (cntr === dataset.length) {
          distribution.ncdc.store.get(null, (e, v) => {
            distribution.ncdc.mr.exec({keys: v, map: mapper, reduce: reducer}, (e, v) => {
              try {
                expect(v).toEqual(expect.arrayContaining(expected));
                expect(v.length).toBe(expected.length);
                done();
              } catch (e) {
                done(e);
              }
            });
          });
        }
      });
    });
  });
});

test('(1 pts) student test', (done) => {
  clearStore('ncdc', () => {
    const mapper = (key, value) => {
      if (value.startsWith('#')) return []; // skip comments
      return {[value]: 1};
    };

    const reducer = (key, values) => {
      return {[key]: values.reduce((a, b) => a + b, 0)};
    };

    const dataset = [
      {'k1': '# this is a comment'},
      {'k2': 'real data'},
      {'k3': '# another comment'},
      {'k4': 'real data'},
      {'k5': 'other data'},
    ];

    const expected = [{'real data': 2}, {'other data': 1}];

    let cntr = 0;
    dataset.forEach((o) => {
      const key = Object.keys(o)[0];
      distribution.ncdc.store.put(o[key], key, (e, v) => {
        cntr++;
        if (cntr === dataset.length) {
          distribution.ncdc.store.get(null, (e, v) => {
            distribution.ncdc.mr.exec({keys: v, map: mapper, reduce: reducer}, (e, v) => {
              try {
                expect(v).toEqual(expect.arrayContaining(expected));
                expect(v.length).toBe(2);
                done();
              } catch (e) {
                done(e);
              }
            });
          });
        }
      });
    });
  });
});

beforeAll((done) => {
  ncdcGroup[id.getSID(n1)] = n1;
  ncdcGroup[id.getSID(n2)] = n2;
  ncdcGroup[id.getSID(n3)] = n3;
  console.log('starting node');
  distribution.node.start((e) => {
    if (e) {
      console.log('error starting node');
      done(e);
    }
    console.log('node started');
    const remote = {service: 'status', method: 'stop'};
    remote.node = n1;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n2;
      distribution.local.comm.send([], remote, (e, v) => {
        remote.node = n3;
        distribution.local.comm.send([], remote, (e, v) => {
          const ncdcConfig = {'gid': 'ncdc'};
          startNodes(() => {
            console.log('start nodes');
            distribution.local.groups.put(ncdcConfig, ncdcGroup, (e, v) => {
              if (Object.keys(e).length) {
                done(e);
                return;
              }
              distribution['ncdc'].groups.put(ncdcConfig, ncdcGroup, (e, v) => {
                if (Object.keys(e).length) {
                  done(e);
                  return;
                }
                console.log('done setup');
                done();
              });
            });
          });
        });
      });
    });
  });

  const startNodes = (cb) => {
    distribution.local.status.spawn(n1, (e, v) => {
      if (e) {
        done(e);
        return;
      }
      distribution.local.status.spawn(n2, (e, v) => {
        if (e) {
          done(e);
          return;
        }
        distribution.local.status.spawn(n3, (e, v) => {
          if (e) {
            done(e);
            return;
          }
          console.log('done spawning');
          cb();
        });
      });
    });
  };
});

afterAll((done) => {
  const remote = {service: 'status', method: 'stop'};
  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        if (globalThis.distribution.node.server) {
          globalThis.distribution.node.server.close();
        }
        done();
      });
    });
  });
});
