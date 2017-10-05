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

var limiter = new RateLimit({
    windowMs: 60*1000, // 1 minute
    max: 12, // limit each IP to 12 requests per windowMs
    delayMs: 0 // disable delaying - full speed until the max limit is reached
});

const server = express();
server.enable('trust proxy');
server.use(helmet())
server.use(compression())
server.use(bodyParser.json({ limit: '5mb' }));
server.use('/static/', express.static('../frontend/build/static'));
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
    function (request, response) {
        const payload = request.body.code;
        const hash = crypto.createHash('md5').update(payload).digest("hex");
        fs.writeFile("./code/shares/" + hash + ".sml", payload, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
            response.set('Content-Type', 'text/plain');
            response.end(hash);
        });
    }
);

server.get('/api/share/:code',
    function (request, response) {
        const code = request.params.code;
        outputFile("./code/shares/" + code + ".sml", response);
    }
);

server.get('/api/list/',
    function (request, response) {
        listDir('./code/examples/', response);
    }
);

server.get('/code/:code',
    function (request, response) {
        const code = request.params.code;
        outputFile("./code/examples/" + code + ".sml", response);
    }
);

server.get('/interpreter.js', function (request, response) {
    response.sendFile(path.resolve('../frontend/build/interpreter.js'));
});

server.get('/webworker.js', function (request, response) {
    response.sendFile(path.resolve('../frontend/build/webworker.js'));
});

server.get('/logo.png', function (request, response) {
    response.sendFile(path.resolve('../frontend/build/logo.png'));
});

server.get('/favicon.png', function (request, response) {
    response.sendFile(path.resolve('../frontend/build/favicon.png'));
});

server.get('/', function (request, response) {
    response.sendFile(path.resolve('../frontend/build/index.html'));
});

server.use(function (request, response) {
    response.sendFile(path.resolve('../frontend/build/index.html'));
});

server.listen(8000, function () {
    console.log('yay');
});
