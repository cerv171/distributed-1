// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../types.js").Node} Node
 */

const { group } = require("yargs");
const local = require("../local/local.js");
// const node = require("../local/node.js");
const util = globalThis.distribution.util;

/**
 * @typedef {import("../types.js").SimpleConfig} SimpleConfig
 * @typedef {Object} Mem
 * @property {(configuration: SimpleConfig, callback: Callback) => void} get
 * @property {(state: any, configuration: SimpleConfig, callback: Callback) => void} put
 * @property {(state: any, configuration: SimpleConfig, callback: Callback) => void} append
 * @property {(configuration: SimpleConfig, callback: Callback) => void} del
 * @property {(configuration: Object.<string, Node>, callback: Callback) => void} reconf
 */


/**
 * @param {Config} config
 * @returns {Mem}
 */
function mem(config) {
  const context = {};
  context.gid = config.gid || 'all';
  context.hash = config.hash || globalThis.distribution.util.id.naiveHash;

  /**
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function get(configuration, callback) {
    /** @type {string | null} */
    const key = (typeof(configuration) == 'string' || configuration == null) ? /** @type {string | null} */ (configuration) : configuration.key;
    local.groups.get(context.gid, (e, /** @type {Object.<string, Node>} */ group) => {
      const nids = Object.values(group).map((node) => util.id.getNID(node));
      const nidsToNode = {};
      for (const node of Object.values(group)) {
        nidsToNode[util.id.getNID(node)] = node;
      }
      if (key) {
        const targetNode = nidsToNode[context.hash(util.id.getID(key), nids)];
        const remote = {node: targetNode, service: 'mem', method: 'get'};
        const params = {key: key, gid: context.gid};
        local.comm.send([params], remote, (e, v) => {
          return callback(e, v);
        });
      } else {
        const keys = [];
        let sent = 0;
        for (const node of Object.values(group)) {
          const remote = {node: node, service: 'mem', method: 'get'};
          const params = {key: key, gid: context.gid};
          local.comm.send([params], remote, (e, v) => {
            if (e) {
              return callback(Error(e.message));
            }
            sent++;
            keys.push(...v);
            if (sent == Object.keys(group).length) {
              const unique = [...new Set(keys)];
              if (unique.length !== keys.length) {
                return callback(Error('duplicate keys found'));
              }
              return callback(null, keys);
            }
          });
        }
      }
    });
  }

  /**
   * @param {any} state
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function put(state, configuration, callback) {
    /** @type {string | null} */
    const key = ((configuration == null || typeof(configuration) === 'string') ? /** @type {string | null} */ (configuration) : configuration.key) || util.id.getID(state);
    local.groups.get(context.gid, (e, /** @type {Object.<string, Node>} */ group) => {
      const nids = Object.values(group).map((node) => util.id.getNID(node));
      const nidsToNode = {};
      for (const node of Object.values(group)) {
        nidsToNode[util.id.getNID(node)] = node;
      }
      const targetNode = nidsToNode[context.hash(util.id.getID(key), nids)];
      const message = {key: key, gid: context.gid};
      const remote = {node: targetNode, service: 'mem', method: 'put'};
      local.comm.send([state, message], remote, (e, v) => {
        if (e) {
          return callback(Error(e.message));
        }
        return callback(null, v);
      });
    });
  }

  /**
   * @param {any} state
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function append(state, configuration, callback) {
    return callback(new Error('mem.append not implemented')); // You'll need to implement this method for the distributed processing milestone.
  }

  /**
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function del(configuration, callback) {
    /** @type {string | null} */
    const key = ((configuration == null || typeof(configuration) === 'string') ? /** @type {string | null} */ (configuration) : configuration.key);
    if (key == null) {
      return callback(Error(`can't delete null key`));
    }
    local.groups.get(context.gid, (e, /** @type {Object.<string, Node>} */ group) => {
      const nids = Object.values(group).map((node) => util.id.getNID(node));
      const nidsToNode = {};
      for (const node of Object.values(group)) {
        nidsToNode[util.id.getNID(node)] = node;
      }
      const targetNode = nidsToNode[context.hash(util.id.getID(key), nids)];
      const message = {key: key, gid: context.gid};
      const remote = {node: targetNode, service: 'mem', method: 'del'};
      local.comm.send([message], remote, (e, v) => {
        if (e) {
          return callback(Error(e.message));
        }
        return callback(null, v);
      });
    });
  }

  /**
   * @param {Object.<string, Node>} configuration
   * @param {Callback} callback
   */
  function reconf(configuration, callback) {
    return callback(new Error('mem.reconf not implemented'));
  }
  /* For the distributed mem service, the configuration will
          always be a string */
  return {
    get,
    put,
    append,
    del,
    reconf,
  };
}

module.exports = mem;
