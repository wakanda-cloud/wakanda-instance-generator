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

    generate(appOptions) {
        let name = appOptions.appName;
        name = appOptions.company.replace(' ', '').trim().toLowerCase() + "-" +
        name.replace(' ', '').trim().toLowerCase();
        name = name.replace(/[^a-zA-Z0-9]/g, '');

        let data = {
            app : {
                name: name
            },
            source_blob: {
                url: "https://github.com/lucasventurasc/wakanda/tarball/master"
            },
            env : {
                DECRYPT_KEY : appOptions.decryptKey,
                SECURITY_TOKEN : appOptions.securityToken
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
                console.log("Created app " + name);
            } else {
                console.log('Status error received: ' + response.statusCode + " because : " + body);
            }
        }

        request(options, callback);
        return "https://" + name + ".herokuapp.com";
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
