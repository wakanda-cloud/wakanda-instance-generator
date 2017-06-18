'use strict';

var request = require('request');

class HerokuSecurityUpdater {

    configureSecurity(decryptKey, securityToken, appName) {

        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.heroku+json; version=3',
            'Authorization': process.env.herokuauth
        };

        var dataString = '{ \"DECRYPT_KEY\":\"' + decryptKey + '\", \"SECURITY_TOKEN\": \"' + securityToken + '\" }';

        var options = {
            url: 'https://api.heroku.com/apps/' + appName + '/config-vars',
            method: 'PATCH',
            headers: headers,
            body: dataString
        };

        function callback(error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log("Heroku security configurated for app " + appName);
            }
            console.log(body);
        }
        request(options, callback);
    }
}

module.exports = HerokuSecurityUpdater;