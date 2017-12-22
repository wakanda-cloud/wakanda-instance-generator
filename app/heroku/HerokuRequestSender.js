var request = require('request');

class HerokuRequestSender {

    constructor(herokuauth, requestSender) {
        this.herokuauth = herokuauth;
        this.requestSender = requestSender;
    }

    request(options, callback) {
        options.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.heroku+json; version=3',
            'Authorization': 'Bearer ' + this.herokuauth
        };
        this.requestSender.request(options, callback);
    }
}

module.exports = HerokuRequestSender;