'use strict';

var request = require('request');

class HerokuDatabaseConfigurator {

    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    configureMongo(appName) {
        console.log('Configuring MongoDB for ' + appName);
        var dataString = '{  \"plan\": \"mongolab:sandbox\" }';

        var options = {
            url: 'https://api.heroku.com/apps/' + appName + '/addons',
            method: 'POST',
            body: dataString
        };

        function callback(error, response, body) {
            if (!error && response.statusCode >= 200 && response.statusCode <= 206) {
                console.log("Mongodb configurated for app " +appName);
            } else {
                console.log("Error on config mongo: status: " + response.statusCode + " : " + body);
            }
        }

        this._requestSender.request(options, callback);
    }
}
module.exports = HerokuDatabaseConfigurator;