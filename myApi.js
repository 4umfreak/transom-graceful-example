
// App should be restarted after 10 liveness checks.
let liveCounter = 0;

// Should be ready after 10 seconds.
let isReady = false;
setTimeout(() => {
    console.log('App /readiness will return a 200 now!');
    isReady = true;
}, 10000);


module.exports = {
    note:
        'This is a very simple example NodeJS app that uses TransomJS and the transom-graceful module.',
    name: 'My Graceful Example App',
    transom: {},
    definition: {
        graceful: {
            beforeShutdown: server => {
                return new Promise((resolve, reject) => {
                    console.log(
                        '%s is going down, do some cleanup!',
                        server.name
                    );
                    // artificial delay
                    setTimeout(() => {
                        console.log('server is done beforeShutdown!');
                        resolve();
                    }, 1000);
                });
            },
            onSignal: server => {
                return new Promise((resolve, reject) => {
                    console.log('%s says onSignal!', server.name);
                    // artificial delay
                    setTimeout(() => {
                        console.log('server is done onSignal!');
                        resolve();
                    }, 1000);
                });
            },
            afterShutdown: server => {
                return new Promise((resolve, reject) => {
                    console.log('%s says afterShutdown!', server.name);
                    // artificial delay
                    setTimeout(() => {
                        console.log('server is done afterShutdown!');
                        resolve();
                    }, 1000);
                });
            },
            healthChecks: {
                '/healthcheck': function(server, req, res, next) {
                    console.log(server.name + ' is all good!');
                    res.json({
                        status: 'ok'
                    });
                    next();
                },
                '/readiness': function(server, req, res, next) {
                    if (isReady) {
                        console.log(
                            server.name,
                            'is',
                            isReady ? '' : 'NOT',
                            'ready. Try again in 10 seconds.'
                        );
                        res.json({
                            status: 'ok'
                        });
                    } else {
                        res.statusCode = 503;
                        res.json({
                            status: 'App not ready!'
                        });
                    }
                    next();
                },
                '/liveness': function(server, req, res, next) {
                    if (liveCounter < 10) {
                        console.log(
                            server.name + ' is all good:',
                            liveCounter++
                        );
                        res.json({
                            status: 'ok'
                        });
                    } else {
                        res.statusCode = 503;
                        res.json({
                            status: 'App needs to restart!'
                        });
                    }
                    next();
                }
            }
        }
    }
};
