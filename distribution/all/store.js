// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../types.js").Hasher} Hasher
 * @typedef {import("../types.js").Node} Node
 */


/**
 * @typedef {Object} StoreConfig
 * @property {string | null} key
 * @property {string} gid
 *
 * @typedef {StoreConfig | string | null} SimpleConfig
 */

const local = require("../local/local.js");
const util = require("../util/util.js");
/**
 * @param {Config} config
 */
function store(config) {
  const context = {
    gid: config.gid || 'all',
    hash: config.hash || globalThis.distribution.util.id.naiveHash,
    subset: config.subset,
  };

  /**
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function get(configuration, callback) {
    const key = (typeof(configuration) == 'string' || configuration == null) ? /** @type {string | null} */ (configuration) : configuration.key;
    local.groups.get(context.gid, (e, /** @type {Object.<string, Node>} */ group) => {
      if (e) {
        return callback(e);
      }
      const nids = Object.values(group).map((node) => util.id.getNID(node));
      const nidsToNode = {};
      for (const node of Object.values(group)) {
        nidsToNode[util.id.getNID(node)] = node;
      }
      if (key) {
        const targetNode = nidsToNode[context.hash(util.id.getID(key), nids)];
        const remote = {node: targetNode, service: 'store', method: 'get'};
        const params = {key: key, gid: context.gid};
        local.comm.send([params], remote, (e, v) => {
          return callback(e, v);
        });
      } else {
        const keys = [];
        let sent = 0;
        for (const node of Object.values(group)) {
          const remote = {node: node, service: 'store', method: 'get'};
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
      if (e) {
        return callback(e);
      }
      const nids = Object.values(group).map((node) => util.id.getNID(node));
      const nidsToNode = {};
      for (const node of Object.values(group)) {
        nidsToNode[util.id.getNID(node)] = node;
      }
      const targetNode = nidsToNode[context.hash(util.id.getID(key), nids)];
      const message = {key: key, gid: context.gid};
      const remote = {node: targetNode, service: 'store', method: 'put'};
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
    return callback(new Error('store.append not implemented')); // You'll need to implement this method for the distributed processing milestone.
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
      if (e) {
        return callback(e);
      }
      const nids = Object.values(group).map((node) => util.id.getNID(node));
      const nidsToNode = {};
      for (const node of Object.values(group)) {
        nidsToNode[util.id.getNID(node)] = node;
      }
      const targetNode = nidsToNode[context.hash(util.id.getID(key), nids)];
      const message = {key: key, gid: context.gid};
      const remote = {node: targetNode, service: 'store', method: 'del'};
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
    return callback(new Error('store.reconf not implemented'));
  }

  /* For the distributed store service, the configuration will
          always be a string */
  return {get, put, append, del, reconf};
}

module.exports = store;
