'use strict';
const debug = require('debug')('transom:openapi');

function TransomOpenApi() {

	this.initialize = function (server, options) {
		return new Promise(function (resolve, reject) {
			debug('initializing TransomOpenApi');
			options = options || {};
			options.path = options.path || '/openapi.json';

			const openapi = options.openapi || {};
			openapi.info  = options.openapi.info|| {};
			openapi.info.title = openapi.info.title || 'TransomJS REST API';
			openapi.info.version = openapi.info.version || '0.0.0';

			const openApiData = {
				openapi: "3.0.0",
				info: openapi.info,
				paths: {}
			};

			if (openapi.servers) {
				openApiData.servers = openapi.servers;
			}


			server.on('transom.route.get', function(props){
				const opts = props[0]; // first arg is the route path details
				if (typeof opts === 'object' && opts.meta) {
					//console.log('transom.route.get', opts.meta);
					openApiData.paths[opts.path] = openApiData.paths[opts.path] || {};
					openApiData.paths[opts.path].get = {};
					openApiData.paths[opts.path].get.summary = opts.meta.summary;
					openApiData.paths[opts.path].get.operationId = opts.meta.operationId;
					openApiData.paths[opts.path].get.tags = opts.meta.tags; // an array of String
					
					// Add all the properties of a 'model' as optional parameters
					openApiData.paths[opts.path].get.parameters = [];
				} else {
					console.log('transom.route.get', opts.path || opts, 'has no meta!');
				}
			});			

			server.get(options.outputPath, function(req, res, next) {
				
				res.json(openApiData);
			});			

			resolve();
		});
	}
}

module.exports = new TransomOpenApi();