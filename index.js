'use strict';
const Transom = require('@transomjs/transom-core');
const transomGraceful = require('@transomjs/transom-graceful');
const opn = require('open');

const transom = new Transom();

// ****************************************************************************
// This sample app doesn't use any metadata from the API definition.
// ****************************************************************************
const myApi = require('./myApi');
console.log('Running', myApi.name);

transom.configure(transomGraceful);

// Initialize my TransomJS API metadata.
transom
    .initialize(myApi)
    .then(function(server) {
        server.get('/', function(req, res, next) {
            const samples = [
                '/hello',
                '/healthcheck',
                '/liveness',
                '/readiness'
            ];
            let page = '<ul>';
            for (const url of samples) {
                page += `<li><a href="${url}">${url}</a></li>`;
            }
            page += '</ul>';
            res.setHeader('content-type', 'text/html');
            res.end(page);
        });

        server.get('/hello', function(req, res, next) {
            res.end('world!');
        });

        // ****************************************************************************
        // Handle 404 errors when a route is undefined.
        // ****************************************************************************
        server.get('/*', function(req, res, next) {
            const err = new Error(req.url + ' does not exist');
            err.status = 404;
            next(err);
        });

        // ****************************************************************************
        // Handle Errors within the app as our last middleware.
        // ****************************************************************************
        server.use(function(error, req, res, next) {
            console.error('Error handler', error);
            const data = {};
            data.error = error;
            res.statusCode = error.status || 501;
            res.send(data);
        });

        // ****************************************************************************
        // Start the Transom server...
        // ****************************************************************************
        server.listen(7070, function() {
            console.log('%s listening at %s', server.name, server.url);
        });
    })
    .then(() => {
        // launch a browser!
        opn('http://localhost:7070/readiness');
    })
    .catch(err => {
        console.error('Error!', err);
    });

// ****************************************************************************
// Handle uncaught exceptions within your code.
// ****************************************************************************
process.on('uncaughtException', function(err) {
    console.error('Really bad Error!', err);
});

// ****************************************************************************
// Handle uncaught rejections within your code.
// ****************************************************************************
process.on('unhandledRejection', function(err) {
    console.error('unhandledRejection', err);
});
