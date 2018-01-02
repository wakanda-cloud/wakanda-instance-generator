var request = require('request');

class RequestSender {

    request(options, callback) {
        console.log('RequestSender > ' + options.method + ' to ' + options.url);
        request(options, callback);
    }
}

module.exports = new RequestSender();