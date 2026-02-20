// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../types.js").SID} SID
 * @typedef {import("../types.js").Node} Node
 *
 * @typedef {Object} Remote
 * @property {Node} node
 * @property {string} service
 * @property {string} method

 * @typedef {Object} Payload
 * @property {Remote} remote
 * @property {any} message
 * @property {string} mid
 * @property {string} gid
 *
 *
 * @typedef {Object} Gossip
 * @property {(payload: Payload, remote: Remote, callback: Callback) => void} send
 * @property {(perod: number, func: () => void, callback: Callback) => void} at
 * @property {(intervalID: NodeJS.Timeout, callback: Callback) => void} del
 */

const log = globalThis.distribution.util.log;
/**
 * @param {Config} config
 * @returns {Gossip}
 */
function gossip(config) {
  const context = {};
  context.gid = config.gid || 'all';
  context.subset = config.subset || function(lst) {
    return Math.ceil(Math.log(lst.length));
  };

  /**
   * @param {Payload} payload
   * @param {Remote} remote
   * @param {Callback} callback
   */
  function send(payload, remote, callback) {
    log(`gossip.send called, gid: ${context.gid}`);
    globalThis.distribution.local.groups.get(payload.gid, (e, group) => {
      if (e) {
        return callback(e);
      }
      if (Object.keys(group).length == 0) {
        return callback(Error(`empty group : ${payload.gid}`));
      };
      const numSend = context.subset(Object.keys(group));
      const send = chooseRandomSlice(Object.keys(group), numSend);
      /** @type {Object.<string, Error>} */
      const errors = {};
      const success = {};
      let sent = 0;
      for (const sid of send) {
        globalThis.distribution.local.comm.send([payload], {...remote, node: group[sid]}, (e, v) => {
          if (e) {
            errors[sid] = e;
            log(`gossip.send group error: ${e.message}`);
          } else {
            success[sid] = v;
          }
          sent +=1;
          if (sent == Object.keys(group).length) {
            return callback(errors, success);
          }
        });
      }
    });
  }
  /**
   * 
   * @param {Array} arr
   * @param {number} count
   */
  function chooseRandomSlice(arr, count) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  }

  /**
   * @param {number} period
   * @param {() => void} func
   * @param {Callback} callback
   */
  function at(period, func, callback) {
    const intervalID = setInterval(() =>{
      func();
    }, period);
    return callback(null, intervalID);
  }

  /**
   * @param {NodeJS.Timeout} intervalID
   * @param {Callback} callback
   */
  function del(intervalID, callback) {
    clearInterval(intervalID);
    return callback(null, intervalID);
  }

  return {send, at, del};
}

module.exports = gossip;
