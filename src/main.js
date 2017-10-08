'use strict';

const serveSharing = true; // determines if sharing is enabled on this server
const sharePath = "code/shares/"; // the path the shared files are placed into
const shareLimits = {
    windowMs: 60*1000, // time window, in which IPs are being tracked in ms
    max: 12, // the amount of allowed requests per time window
    delayMs: 0 // minimum timeout between requests
};
const serveExamples = true; // determines if any examples are served from this server
const examplePath = "code/examples/"; // the path the provided examples are placed into
const serveFrontend = true; // determines if the frontend is being served from this server
const frontendPath = "SOSML-frontend/frontend/build"; // the path the frontend is served from 
const port = 8000; // the port the server is listening to

const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const RateLimit = require('express-rate-limit');

var limiter = new RateLimit(shareLimits);

const server = express();
server.enable('trust proxy');
server.use(helmet())
server.use(compression())
server.use(bodyParser.json({ limit: '5mb' }));
server.use('/static/', express.static('SOSML-frontend/frontend/build/static'));
// server.use('/share/', express.static('shares'));
// server.use('/code/', express.static('code'));

function readFile(name, callback) {
    fs.readFile(name, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        callback(data);
    });
}

function outputFile(name, response) {
    readFile(name, function (data) {
        response.set('Content-Type', 'text/plain');
        response.end(data);
    });
}

function listDir(name, response) {
    fs.readdir(name, function (err, items) {
        response.set('Content-Type', 'text/json');
        response.end(JSON.stringify({codes: items}));
    });
}

server.put('/api/share/', limiter, 
    function (request, response, next) {
        if (serveSharing) {
            const payload = request.body.code;
            const hash = crypto.createHash('md5').update(payload).digest("hex");
            fs.writeFile(sharePath + hash + ".sml", payload, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("A file with hash " + hash + " was saved");
                response.set('Content-Type', 'text/plain');
                response.end(hash);
            });
        } else {
            next();
        }
    }
);

server.get('/api/share/:code',
    function (request, response, next) {
        if (serveSharing) {
            const code = request.params.code;
            if (/^[\d\w]+$/g.test(code)) {
                outputFile(sharePath + code + ".sml", response);
            } else {
                response.sendStatus(400);
            }
        } else {
            next();
        }
    }
);

server.get('/api/list/',
    function (request, response, next) {
        if (serveExamples) {
            listDir(examplePath, response);
        } else {
            next();
        }
    }
);

server.get('/code/:code',
    function (request, response, next) {
        if (serveExamples) {
            const code = request.params.code;
            if (/^[\d\w](\/[\d\w]+|.[\d\w]+|[\d\w])*$/g.test(code)) {
                outputFile(examplePath + code + ".sml", response);
            } else {
                response.sendStatus(400);
            }
        } else {
            next();
        }
    }
);

server.use('/api',
    function (request, response) {
        response.sendStatus(404);
    }
)

server.use('/code',
    function (request, response) {
        response.sendStatus(404);
    }
)

server.get('/interpreter.js', function (request, response, next) {
    if (serveFrontend) {
        response.sendFile(path.resolve(frontendPath + '/interpreter.js'));
    } else {
        next();
    }
});

server.get('/webworker.js', function (request, response, next) {
    if (serveFrontend) {
        response.sendFile(path.resolve(frontendPath + '/webworker.js'));
    } else {
        next();
    }
});

server.get('/logo.png', function (request, response, next) {
    if (serveFrontend) {
        response.sendFile(path.resolve(frontendPath + '/logo.png'));
    } else {
        next();
    }
});

server.get('/favicon.png', function (request, response, next) {
    if (serveFrontend) {
        response.sendFile(path.resolve(frontendPath + '/favicon.png'));
    } else {
        next();
    }
});

server.get('/', function (request, response, next) {
    if (serveFrontend) {
        response.sendFile(path.resolve(frontendPath + '/index.html'));
    } else {
        next();
    }
});

server.use(function (request, response, next) {
    if (serveFrontend) {
        response.sendFile(path.resolve(frontendPath + '/index.html'));
    } else {
        next();
    }
});

server.listen(port, function () {
    console.log('server started');
});
