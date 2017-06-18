'use strict';

var CryptoJS = require("crypto-js");
var bytes = require('bytes');
var request = require('request');

class WakandaApiKeyRegister {

    registerApiKey(wakandaInstanceData) {
        let text = JSON.stringify(wakandaInstanceData);

        let json = CryptoJS.AES.encrypt(text, process.env.ENCRYPT_KEY, {
            mode: CryptoJS.mode.CTR
        }).toString();

        let options = {
            uri: 'https://wakanda-statistic-receiver.herokuapp.com/apikey',
            method: 'POST',
            json: {
                wakandaInstanceData : json
            }
        };

        request(options, function (error, response, body) {
            if(error) throw error;
            console.log(response.statusCode);
        });
    }
}

module.exports = WakandaApiKeyRegister;