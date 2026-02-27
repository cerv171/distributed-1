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
    const gid = (configuration != null && typeof(configuration) == 'object' && configuration.gid) ? configuration.gid : context.gid;
    local.groups.get(gid, (e, /** @type {Object.<string, Node>} */ group) => {
      const nids = Object.values(group).map((node) => util.id.getNID(node));
      const nidsToNode = {};
      for (const node of Object.values(group)) {
        nidsToNode[util.id.getNID(node)] = node;
      }
      if (key) {
        const targetNode = nidsToNode[context.hash(util.id.getID(key), nids)];
        const remote = {node: targetNode, service: 'mem', method: 'get'};
        const params = {key: key, gid: gid};
        local.comm.send([params], remote, (e, v) => {
          return callback(e, v);
        });
      } else {
        const keys = [];
        /** @type {Object.<String, Error>} */
        const errors = {};
        let sent = 0;
        for (const node of Object.values(group)) {
          const remote = {node: node, service: 'mem', method: 'get'};
          const params = {key: key, gid: gid};
          local.comm.send([params], remote, (e, v) => {
            if (e) {
              errors[util.id.getNID(node)] = e;
            } else {
              keys.push(...v);
            }
            sent++;
            if (sent == Object.keys(group).length) {
              const unique = [...new Set(keys)];
              if (unique.length !== keys.length) {
                return callback(Error('duplicate keys found'));
              }
              return callback(errors, keys);
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
    const gid = (configuration != null && typeof(configuration) == 'object' && configuration.gid) ? configuration.gid : context.gid;
    local.groups.get(gid, (e, /** @type {Object.<string, Node>} */ group) => {
      const nids = Object.values(group).map((node) => util.id.getNID(node));
      const nidsToNode = {};
      for (const node of Object.values(group)) {
        nidsToNode[util.id.getNID(node)] = node;
      }
      const targetNode = nidsToNode[context.hash(util.id.getID(key), nids)];
      const message = {key: key, gid: gid};
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
    const gid = (configuration != null && typeof(configuration) == 'object' && configuration.gid) ? configuration.gid : context.gid;
    if (key == null) {
      return callback(Error(`can't delete null key`));
    }
    local.groups.get(gid, (e, /** @type {Object.<string, Node>} */ group) => {
      const nids = Object.values(group).map((node) => util.id.getNID(node));
      const nidsToNode = {};
      for (const node of Object.values(group)) {
        nidsToNode[util.id.getNID(node)] = node;
      }
      const targetNode = nidsToNode[context.hash(util.id.getID(key), nids)];
      const message = {key: key, gid: gid};
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
    const config = {
      gid: context.gid,
      key: null,
    };
    get(config, (e, keys) => {
      if (Object.keys(e).length > 0) {
        return callback(e); // not sure what to do with this error
      }
      local.groups.get(context.gid, (e, curConfiguration) => {
        const oldNidToNode = {};
        const newNidToNode = {};
        const oldNids = Object.entries(configuration).map((obj) => {
          const nid = util.id.getNID(obj[1]);
          oldNidToNode[nid] = obj[1];
          return nid;
        });
        const newNids = Object.entries(curConfiguration).map((obj) => {
          const nid = util.id.getNID(obj[1]);
          newNidToNode[nid] = obj[1];
          return nid;
        });
        /** @type {Object<string, Error>} */
        const errors = {};
        const putResults = {};
        let toResolve = 0;
        let resolved = 0;
        let checkedAll = false;
        const handleDone = () => {
          if ((resolved == toResolve) && checkedAll) {
            return callback(null, putResults);
          }
        };
        for (const key of keys) {
          const oldNid = context.hash(util.id.getID(key), oldNids);
          const newNid = context.hash(util.id.getID(key), newNids);
          if (oldNid != newNid && newNids.includes(oldNid)) {
            const oldNode = oldNidToNode[oldNid];
            const newNode = newNidToNode[newNid];
            console.log(key, oldNode.port, newNode.port);
            toResolve++;
            const message = {gid: context.gid, key: key};
            const remote = {node: oldNode, service: 'mem', method: 'get'};
            local.comm.send([message], remote, (e, getVal) => {
              if (e) {
                errors[key] = e;
                resolved++;
                handleDone();
                return;
              } else {
                const delRemote = {node: oldNode, service: 'mem', method: 'del'};
                local.comm.send([message], delRemote, (e, delVal) => {
                  if (e) {
                    errors[key] = e;
                    resolved++;
                    handleDone();
                    return;
                  };
                  const putRemote = {node: newNode, service: 'mem', method: 'put'};
                  const putMessage = [getVal, {gid: context.gid, key: key}];
                  local.comm.send(putMessage, putRemote, (e, putResult) => {
                    if (e) {
                      errors[key] = e;
                      resolved++;
                      handleDone();
                      return;
                    }
                    putResults[key] = putResult;
                    resolved++;
                    handleDone();
                  });
                });
              }
            });
          }
        }
        checkedAll = true;
        handleDone();
      });
    });
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
