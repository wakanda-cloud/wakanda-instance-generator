process.on('uncaughtException', function (error) {
    console.log("uncaughtException :" + error);
});

var routes = require('./routes');
var requestSender = require('./app/RequestSender');

function run(callback, requestSenderService) {
    var express = require('express');
    var app = express();
    var bodyparser = require('body-parser');

    app.set('port', (process.env.PORT || 8080));
    var server = app.listen(app.get('port'), function () {
        if (!process.env.ENCRYPT_KEY) {
            process.env.ENCRYPT_KEY = "9bcDPot4";
            console.log("ERROR: WILL NOT WORK IF IS INTO PRODUCTION, ENCRYPT KEY NOT SET");
        }

        var host = process.env.host;
        var port = app.get('port');

        if(callback) {
            callback();
        }
        console.log("Listening at http://%s:%s", host, port);
    });

    server.on('close', function() {
        console.log('Server closed');
    });

    app.use(require('cors')());

    app.use(bodyparser.json());

    routes.injectRequestSender(requestSenderService);
    app.post('/generate', routes.generate);
    app.get('/projects', routes.projects);
    app.delete('/projects', routes.deleteProject);

    return server;
}

if(!process.env.TEST_ENVIRONMENT) {
    console.log('Production Environment');
    run(null, requestSender);
} else {
    console.log('Test Environment');
}

exports.run = run;
