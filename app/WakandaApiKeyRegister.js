'use strict';

var CryptoJS = require("crypto-js");

class WakandaApiKeyRegister {

    constructor(requestSender) {
        this.requestSender = requestSender;
    }

    registerApiKey(wakandaInstanceData) {
        console.log('Registering API Key ' + wakandaInstanceData.apiKey + ' for ' + wakandaInstanceData.name);
        let text = JSON.stringify(wakandaInstanceData);

        let json = CryptoJS.AES.encrypt(text, process.env.ENCRYPT_KEY, {
            mode: CryptoJS.mode.CTR
        }).toString();

        let options = {
            url: 'https://wakanda-statistic-receiver.herokuapp.com/apikey',
            method: 'POST',
            json: {
                wakandaInstanceData : json
            }
        };

        this.requestSender.request(options, function (error, response, body) {
            if(error) throw error;
            console.log(response.statusCode);
        });
    }

    unregisterApp(apiKey) {
        var options = {
            method: 'DELETE',
            url: 'http://wakanda-statistic-receiver.herokuapp.com/apikey',
            qs: {apiKey: apiKey}
        };

        this.requestSender.request(options, function (error, response, body) {
            if (error) throw new Error(error);
            console.log("Delete API Register response:" + response.statusCode);
        });
    }
}

module.exports = WakandaApiKeyRegister;