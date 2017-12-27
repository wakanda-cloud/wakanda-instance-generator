'use strict';
var AppNameGenerator = require('../project/AppNameGenerator');

class HerokuAppGenerator {

    constructor(requestSender) {
        this._requestSender = requestSender;
    }

    delete(appName) {
        var options = {
            url: 'https://api.heroku.com/apps/' + appName,
            method: 'DELETE',
        };

        function callback(error, response, body) {
            console.log("Delete response for app: " + appName + " -> " + response.statusCode);
        }

        this._requestSender.request(options, callback);
    }

    generate(appOptions, onSuccess) {
        let appName = AppNameGenerator.buildAppName(appOptions.company, appOptions.name);
        let data = {
            app : {
                name: appName
            },
            source_blob: {
                url: "https://github.com/wakanda-cloud/wakanda/tarball/v2.0"
            }
        };

        let options = {
            url: 'https://api.heroku.com/app-setups',
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data)
        };

        function callback(error, response, body) {
            if (!error && response.statusCode >= 200 && response.statusCode <= 206) {
                console.log("Created app " + appName + " status received: " + response.statusCode);
                onSuccess.call(this, appName, AppNameGenerator.buildAppUrl(appName));
            } else {
                console.log('Status error received: ' + response.statusCode + " because : " + body);
            }
        }

        this._requestSender.request(options, callback);
    }

    //verifyAppCreated(name, callbackAppCreated, callbackError) {
    //    var options = {
    //       url: 'https://api.heroku.com/apps/' + name,
    //        method: 'GET',
    //        headers: this.headers
    //    };
    //    this._requestSender.request(options, function(error, response, body) {
    //        if(response.statusCode === 200) {
    //            callbackAppCreated.apply(this);
    //        } else {
    //            callbackError.apply(this);
    //        }
    //    });
    // }
}
module.exports = HerokuAppGenerator;
