// @ts-check
/**
 * @typedef {import("../types").Callback} Callback
 * @typedef {import("../types").Node} Node
 *
 * @typedef {Object} Payload
 * @property {{service: string, method: string, node: Node}} remote
 * @property {any} message
 * @property {string} mid
 * @property {string} gid
 */

// const N = 10;
const seen = {};
const log = require('../util/log.js');

/**
 * @param {Payload} payload
 * @param {Callback} callback
 */
function recv(payload, callback) {
  if (payload.mid in seen) {
    log(`${globalThis.distribution.node.config.ip} : seen message`);
    return callback(null, 'seen message');
  } else {
    // forward message
    seen[payload.mid] = true;
    globalThis.distribution.local.comm.send(payload.message, payload.remote, (e, v) => {
      log(`${globalThis.distribution.node.config.ip} : sent increment`);
      const remote = {service: 'gossip', method: 'recv'};
      if (!(payload.gid in globalThis.distribution)) {
        return callback(Error(`${globalThis.distribution.node.config.port} not in group ${payload.gid}`), null);
      }
      globalThis.distribution[payload.gid].gossip.send(payload, remote, () => {});
      return callback(null, v);
    });
  }
}

module.exports = {recv};
