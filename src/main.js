'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const RateLimit = require('express-rate-limit');
const config = require(__dirname+'/../config.js');

var limiter = new RateLimit(config.shareLimits);

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
        if (config.serveSharing) {
            const payload = request.body.code;
            const hash = crypto.createHash('sha256').update(payload).digest("hex");
            if (fs.existsSync(config.sharePath + hash + ".sml")) {
                response.set('Content-Type', 'text/plain');
                response.end(hash);
                return;
            }
            fs.writeFile(config.sharePath + hash + ".sml", payload, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("A file with hash " + hash + " was saved");
                response.set('Content-Type', 'text/plain');
                response.end(hash);
            });
        } else {
            next();
            return;
        }
    }
);

server.get('/api/share/:code',
    function (request, response, next) {
        if (config.serveSharing) {
            const code = request.params.code;
            if (/^[\d\w]+$/g.test(code)) {
                outputFile(config.sharePath + code + ".sml", response);
            } else {
                response.sendStatus(400);
            }
        } else {
            next();
            return;
        }
    }
);

server.get('/api/list/',
    function (request, response, next) {
        if (config.serveExamples) {
            listDir(config.examplePath, response);
        } else {
            next();
            return;
        }
    }
);

server.get('/code/:code',
    function (request, response, next) {
        if (config.serveExamples) {
            const code = request.params.code;
            if (/^[\d\w](\/[\d\w]+|.[\d\w]+|[\d\w])*$/g.test(code)) {
                outputFile(config.examplePath + code + ".sml", response);
            } else {
                response.sendStatus(400);
            }
        } else {
            next();
            return;
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
    if (config.serveFrontend) {
        response.sendFile(path.resolve(config.frontendPath + '/interpreter.js'));
    } else {
        next();
        return;
    }
});

server.get('/webworker.js', function (request, response, next) {
    if (config.serveFrontend) {
        response.sendFile(path.resolve(config.frontendPath + '/webworker.js'));
    } else {
        next();
        return;
    }
});

server.get('/logo.png', function (request, response, next) {
    if (config.serveFrontend) {
        response.sendFile(path.resolve(config.frontendPath + '/logo.png'));
    } else {
        next();
        return;
    }
});

server.get('/favicon.png', function (request, response, next) {
    if (config.serveFrontend) {
        response.sendFile(path.resolve(config.frontendPath + '/favicon.png'));
    } else {
        next();
        return;
    }
});

server.get('/', function (request, response, next) {
    if (config.serveFrontend) {
        response.sendFile(path.resolve(config.frontendPath + '/index.html'));
    } else {
        next();
        return;
    }
});

server.use(function (request, response, next) {
    if (config.serveFrontend) {
        response.sendFile(path.resolve(config.frontendPath + '/index.html'));
    } else {
        next();
        return;
    }
});

server.listen(config.port, function () {
    console.log('server started');
});
