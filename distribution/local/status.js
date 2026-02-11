// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Node} Node
 */
const util = require('../util/util.js');
/**
 * @param {string} configuration
 * @param {Callback} callback
 */
let counts = 0;
function get(configuration, callback) {
  const config = globalThis.distribution.node.config;
  const nid = util.id.getNID(config);
  const sid = util.id.getSID(config);
  const commands = {
    nid: nid,
    sid: sid,
    ip: config.ip,
    port: config.port,
    counts: counts,
    heapTotal: process.memoryUsage().heapTotal,
    heapUsed: process.memoryUsage().heapUsed,
  };
  if (configuration in commands) {
    return callback(null, commands[configuration]);
  } else {
    return callback(new Error(`Key ${configuration} not found in status`), null);
  }
};

function incCounts() {
  counts++;
}
/**
 * @param {Node} configuration
 * @param {Callback} callback
 */
function spawn(configuration, callback) {
  callback(new Error('status.spawn not implemented'));
}

/**
 * @param {Callback} callback
 */
function stop(callback) {
  callback(new Error('status.stop not implemented'));
}

module.exports = {get, spawn, stop, incCounts};
