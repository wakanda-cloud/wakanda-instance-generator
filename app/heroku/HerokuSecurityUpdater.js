'use strict';

class HerokuSecurityUpdater {

    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    configureSecurity(decryptKey, apiKey, appName) {
        console.log('Configuring security for ' + appName);
        var dataString = JSON.stringify({
            DECRYPT_KEY : decryptKey,
            API_KEY : apiKey
        });

        var options = {
            url: 'https://api.heroku.com/apps/' + appName + '/config-vars',
            method: 'PATCH',
            body: dataString
        };

        function callback(error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log("Heroku security configurated for app " + appName);
            }
            console.log(body);
        }
        this._requestSender.request(options, callback);
    }
}

module.exports = HerokuSecurityUpdater;