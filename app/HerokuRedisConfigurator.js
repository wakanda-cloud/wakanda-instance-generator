'use strict';

var request = require('request');

class HerokuRedisConfigurator {

    configureRedis(appName) {

        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.heroku+json; version=3',
            'Authorization': process.env.herokuauth
        };

        var dataString = '{  \"plan\": \"heroku-redis:hobby-dev\" }';

        var options = {
            url: 'https://api.heroku.com/apps/' + appName + '/addons',
            method: 'POST',
            headers: headers,
            body: dataString
        };

        function callback(error, response, body) {
            if (!error && response.statusCode >= 200 && response.statusCode <= 206) {
                console.log("Redis configurated for app " +appName);
            } else {
                console.log("Error on config redis: status: " + response.statusCode + " : " + body);
            }
        }

        request(options, callback);
    }
}
module.exports = HerokuRedisConfigurator;