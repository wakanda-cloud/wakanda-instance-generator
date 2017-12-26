process.on('uncaughtException', function (error) {
    console.log("uncaughtException :" + error);
});

function run(callback) {
    var express = require('express');
    var app = express();
    var bodyparser = require('body-parser');

    app.set('port', (process.env.PORT || 6000));
    var server = app.listen(app.get('port'), function () {

        if (!process.env.ENCRYPT_KEY) {
            process.env.ENCRYPT_KEY = "12345678";
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

    var routes = require('./routes');
    app.use(require('cors')());

    app.use(bodyparser.json());
    app.post('/generate', routes.generate);
    app.get('/projects', routes.projects);
    app.delete('/projects', routes.deleteProject);

    return server;
}

if(!process.env.TEST_ENVIRONMENT) {
    console.log('Production Environment');
    run();
}

exports.run = run;
