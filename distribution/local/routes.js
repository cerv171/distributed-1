/**
 * @typedef {import("../types").Callback} Callback
 * @typedef {string} ServiceName
 */

const routes = {};
/**
 * @param {ServiceName | {service: ServiceName, gid?: string}} configuration
 * @param {Callback} callback
 * @returns {void}
 */
function get(configuration, callback) {
  let service;
  if (typeof configuration == 'string') {
    service = configuration;
  } else if (configuration && typeof configuration == 'object' && configuration.service) {
    service = configuration.service;
  } else {
    return callback(new Error('invalid config'));
  }
  if (service in routes) {
    return callback(null, routes[service]);
  } else {
    return callback(new Error(`Service ${service} not in routes`));
  }
}

/**
 * @param {object} service
 * @param {string} configuration
 * @param {Callback} callback
 * @returns {void}
 */
function put(service, configuration, callback) {
  routes[configuration] = service;
  return callback(null, configuration);
}

/**
 * @param {string} configuration
 * @param {Callback} callback
 */
function rem(configuration, callback) {
  if (configuration in routes) {
    const service = routes[configuration];
    delete routes[configuration];
    return callback(null, service);
  } else {
    return callback(new Error(`Service ${configuration} not in routes`));
  }
}

module.exports = {get, put, rem};
