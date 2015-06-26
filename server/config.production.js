var GLOBAL_CONFIG = require('../global-config');

var isDevEnv = (process.env.NODE_ENV || 'production') === 'production';

module.exports = {
  host: process.env.CUSTOM_HOST,
  port: GLOBAL_CONFIG.port,
  hostname: GLOBAL_CONFIG.hostname,
  restApiRoot: GLOBAL_CONFIG.restApiRoot,
  livereload: process.env.LIVE_RELOAD,
  isDevEnv: isDevEnv,
  indexFile: require.resolve(isDevEnv ?
    '../client/index.html' : '../client/dist/index.html'),
  legacyExplorer: GLOBAL_CONFIG.legacyExplorer,

  remoting: {
    errorHandler: { disalbeStackTrace: false },
    json: { strict: false, limit: '100kb'},
    cors: false,
    urlencoded: { extended: true, limit: '100kb'},
    context: { enableHttpContext: false },
    rest: { normalizeHttpPath: false, xml: false }
  }
};
