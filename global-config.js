/*
 * Global configuration shared by components
 */

var url = require('url');
var p = require('./package.json');

var version = p.version.split('.').shift();

var conf = {
  hostname: 'localhost',
  port: 4000,
  restApiRoot: '/api' + (version > 0 ? '/v' + version : '') , // The path where to mount the REST API app
  legacyExplorer: false
};

// The URL where the browser client can access the REST API is available.
// Replace with a full url (including hostname) if your client is being
// served from a different server than your REST API.
conf.restApiUrl = url.format({
  protocol: 'http',
  slashes: true,
  hostname: conf.hostname,
  port: conf.port,
  pathname: conf.restApiRoot
});

conf.agendaDB = {
  hostname: '192.168.4.29',
  port: 27017
};



module.exports = conf;
