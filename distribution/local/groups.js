//@ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../types.js").Node} Node
 */

const { id } = require("../util/util.js");

/** @type {Object.<string, Object.<string, Node>>} */
const groups = {};
groups['local'] = {[id.getSID(globalThis.distribution.node.config)]: distribution.node.config};
groups['all'] = {[id.getSID(globalThis.distribution.node.config)]: distribution.node.config};
/**
 * @param {string} name
 * @param {Callback} callback
 */
function get(name, callback) {
  if (name in groups) {
    return callback(null, groups[name]);
  }
  return callback(new Error(`name not ${name} not in groups`));
}

/**
 * @param {Config | string} config
 * @param {Object.<string, Node>} group
 * @param {Callback} callback
 */
function put(config, group, callback) {
  let gid = typeof config != 'string' ? config.gid : config;
  groups[gid] = group;
  const services = require('../all/all.js');
  globalThis.distribution[gid] = services.setup(typeof config == 'object' ? config : {gid: config});
  return callback(null, groups[gid]);
}

/**
 * @param {string} name
 * @param {Callback} callback
 */
function del(name, callback) {
  delete groups[name];
  delete globalThis.distribution[name];
  return callback(null, {});
}

/**
 * @param {string} name
 * @param {Node} node
 * @param {Callback} callback
 */
function add(name, node, callback) {
  if (!(name in groups)) {
    groups[name] = {};
  }
  groups[name][id.getSID(node)] = node;
  return callback(null ,node);
};

/**
 * @param {string} name
 * @param {string} node
 * @param {Callback} callback
 */
function rem(name, node, callback) {
  if (!(name in groups)) {
    return callback(new Error(`name ${name} not in groups`));
  }
  if (!(Object.keys(groups[name]).includes(node))) {
    return callback(new Error(`node ${node} not in ${groups[name]}`));
  }
  delete groups[name][node];
  return callback(null, groups[name]);
};

module.exports = {get, put, del, add, rem};
