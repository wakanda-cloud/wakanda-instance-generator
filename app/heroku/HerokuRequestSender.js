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
        console.log('Cheguei aqui com OPTIONS => ' + JSON.stringify(options));
        this.requestSender.request(options, callback);
    }
}

module.exports = HerokuRequestSender;