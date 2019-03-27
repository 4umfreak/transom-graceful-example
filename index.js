'use strict';
const Transom = require('@transomjs/transom-core');
const transomScaffold = require('@transomjs/transom-scaffold');
const transomGraceful = require('@transomjs/transom-graceful');
// const transomOpenApi = require('./transomOpenApi');

const opn = require('opn');

const transom = new Transom();


// ****************************************************************************
// This sample app doesn't use any metadata from the API definition.
// ****************************************************************************
const myApi = require('./myApi');
console.log("Running " + myApi.name);


// Register my TransomJS SMTP module.
transom.configure(transomScaffold, {});

// App should be restarted after 10 liveness checks.
let liveCounter = 0;

// Should be ready after 10 seconds.
let isReady = false;
setTimeout(() => {
	console.log('App /readiness will return a 200 now!');
	isReady = true;
}, 10000);


transom.configure(transomGraceful, {
	beforeShutdown: (server) => {
		return new Promise((resolve, reject) => {
			console.log('%s is going down, do some cleanup!', server.name);
			// artificial delay
			setTimeout(() => {
				console.log('server is done beforeShutdown!');
				resolve();
			}, 1000);
		});
	},
	onSignal: (server) => {
		return new Promise((resolve, reject) => {
			console.log("%s says onSignal!", server.name);
			// artificial delay
			setTimeout(() => {
				console.log('server is done onSignal!');
				resolve();
			}, 1000);
		});
	},
	afterShutdown: (server) => {
		return new Promise((resolve, reject) => {
			console.log("%s says afterShutdown!", server.name);
			// artificial delay
			setTimeout(() => {
				console.log('server is done afterShutdown!');
				resolve();
			}, 1000);
		});
	},
	healthChecks: {
		"/healthcheck": function (server, req, res, next) {
			console.log(server.name + ' is all good!');
			res.json({
				status: 'ok'
			});
			next();
		},
		"/readiness": function(server, req, res, next) {
			if (isReady) {
				console.log(server.name + ' is all good:', liveCounter++);
				res.json({
					status: 'ok'
				});	
			} else {
				res.statusCode = 503;
				res.json({
					status: 'App not ready!'
				})
			}
			next();
		},
		"/liveness": function(server, req, res, next) {
			if (liveCounter < 10) {
				console.log(server.name + ' is all good:', liveCounter++);
				res.json({
					status: 'ok'
				});	
			} else {
				res.statusCode = 503;
				res.json({
					status: 'App needs restart!'
				})
			}
			next();
		}
	}
});

// transom.configure(transomOpenApi, {
// 	path: "/swagger.json",
// 	openapi: {
// 		info: {
// 			"title": "Sample Pet Store App",
// 			"description": "This is a sample server for a pet store.",
// 			"termsOfService": "http://example.com/terms/",
// 			"contact": {
// 				"name": "API Support",
// 				"url": "http://www.example.com/support",
// 				"email": "support@example.com"
// 			},
// 			"license": {
// 				"name": "Apache 2.0",
// 				"url": "https://www.apache.org/licenses/LICENSE-2.0.html"
// 			},
// 			"version": "1.0.1"
// 		},
// 		servers: {
// 			dev: 'http://localhost:8080',
// 			prod: 'https://api.myserver.com'
// 		}
// 	}
// });

// Initialize my TransomJS API metadata.
transom.initialize(myApi).then(function (server) {

	// Tell health checks that we're shutting down.
	// server.use(transomGraceful.middleware(server));

	server.get({
		meta: {
			foo: 'bar',
			bar: 1234.5,
			baz: {
				things: true
			}
		},
		path: '/'
	}, function (req, res, next) {

		const samples = [
			'/assets/transomlogo.png',
			'/redirect',
			'/swagger.json',
			'/healthcheck',
			'/liveness'
		];
		let page = '<ul>';
		for (const url of samples) {
			page += `<li><a href="${url}">${url}</a></li>`

		}
		page += '</ul>';
		res.setHeader('content-type', 'text/html');
		res.end(page);
	});


	server.get({
		path: '/hello'
	}, function (req, res, next) {
		res.end('world!');
	});

	server.get('/jam', function (req, res, next) {
		res.end('funk!');
	});

	// ****************************************************************************
	// Handle 404 errors when a route is undefined.
	// ****************************************************************************
	server.get('/*', function (req, res, next) {
		var err = new Error(req.url + " does not exist");
		err.status = 404;
		next(err);
	});

	// ****************************************************************************
	// Handle Errors within the app as our last middleware.
	// ****************************************************************************
	server.use(function (error, req, res, next) {
		console.error("Error handler", error);
		var data = {};
		data.error = error;
		res.statusCode = error.status || 501;
		res.send(data);
	});


	// ****************************************************************************
	// Start the Transom server...
	// ****************************************************************************


	// function gracefulHealthCheck() {
	// 	setTimeout(() => {
	// 		return Promise.resolve();
	// 	}, 5000);
	// }
	// server = createTerminus(server.restify, {
	// 	// signals: options.signals || ['SIGINT', 'SIGTERM'],
	// 	// timeout: options.timeout || 5000,
	// 	// onSignal: gracefulBeforeShutdown,
	// 	healthChecks: {
	// 		'/healthcheck': () => Promise.resolve() // gracefulHealthCheck,
	// 	},
	// 	// onShutdown: gracefulAfterShutdown,
	// 	// logger: options.logger
	// });


	server.listen(7070, function () {
		console.log('%s listening at %s', server.name, server.url);
		console.log('browse to http://localhost:7070/assets/transomlogo.png');
	});

}).then(() => {
	// launch a browser!
	opn('http://localhost:7070/');
}).catch((err) => {
	console.error('Error!', err);
});

// ****************************************************************************
// Handle uncaught exceptions within your code.
// ****************************************************************************
process.on('uncaughtException', function (err) {
	console.error('Really bad Error!', err);
});

// ****************************************************************************
// Handle uncaught rejections within your code.
// ****************************************************************************
process.on('unhandledRejection', function (err) {
	console.error('unhandledRejection', err);
});

/*
// Put the server into a 'shutting down' state.
process.on('SIGINT', function (message) {
	console.log('SIGINT', arguments);
	// if (message === 'shutdown') {
	//     transomGraceful.gracefulExitHandler(server, {}, {
	//         // socketio: app.settings.socketio,
	//         log: true
	//     });
	// }
});

process.on('SIGTERM', function (message) {
	console.log('SIGTERM', arguments);
	// if (message === 'shutdown') {
	//     transomGraceful.gracefulExitHandler(server, {}, {
	//         // socketio: app.settings.socketio,
	//         log: true
	//     });
	// }
});
*/