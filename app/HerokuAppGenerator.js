'use strict';
var request = require('request');

class HerokuAppGenerator {

    constructor() {
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.heroku+json; version=3',
            'Authorization': process.env.herokuauth
        }
    }

    delete(appName) {
        var options = {
            url: 'https://api.heroku.com/apps/' + appName,
            method: 'DELETE',
            headers: this.headers
        };


        function callback(error, response, body) {
            console.log("Delete response for app: " + appName + " -> " + response.statusCode);
        }

        request(options, callback);
    }

    generate(appOptions, onSuccess) {
        let appName = appOptions.company.replace(' ', '').replace(/[^a-zA-Z0-9]/g, '').trim().toLowerCase();
        appName = appName + "-";
        appName = appName + appOptions.name.replace(' ', '').replace(/[^a-zA-Z0-9]/g, '').trim().toLowerCase();

        let data = {
            app : {
                name: appName
            },
            source_blob: {
                url: "https://github.com/wakanda-cloud/wakanda/tarball/beta-mongo"
            }
        };

        var options = {
            url: 'https://api.heroku.com/app-setups',
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data)
        };

        function callback(error, response, body) {
            if (!error && response.statusCode >= 200 && response.statusCode <= 206) {
                onSuccess.call(this, appName, "https://" + appName + ".herokuapp.com");
                console.log("Created app " + appName);
            } else {
                console.log('Status error received: ' + response.statusCode + " because : " + body);
            }
        }

        request(options, callback);
    }

    verifyAppCreated(name, callbackAppCreated, callbackError) {
        var options = {
            url: 'https://api.heroku.com/apps/' + name,
            method: 'GET',
            headers: this.headers
        };
        request(options, function(error, response, body) {
            if(response.statusCode === 200) {
                callbackAppCreated.apply(this);
            } else {
                callbackError.apply(this);
            }
        });
    }
}
module.exports = HerokuAppGenerator;
