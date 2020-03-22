// Logs
var mes = require('../../message');


// Allowed IP:HOST to proxy to.
var allowed_ip = require('../../../allowed');


// This method will check if this websocket can proxy to this server
// next(boolean) will expect a true or false
//
// @param {Object}
// @param {Function} next module to execute from stack
function checkAllowed(info, next) {
	var target = info.req.url.substr(1);
	var from   = info.req.connection.remoteAddress;

	// Reject
	if (allowed_ip.length && allowed_ip.indexOf(target) < 0) {
		mes.info("Reject requested connection from '%s' to '%s'.", from, target);
		next(false);
	}

	next(true);
}


// Exports methods
module.exports = {
	verify: checkAllowed //module.verify method
}
