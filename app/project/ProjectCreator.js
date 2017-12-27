'use strict';

let HerokuAppGenerator = require('../heroku/HerokuAppGenerator');
let HerokuDatabaseConfigurator = require('../heroku/HerokuDatabaseConfigurator');
let WakandaApiKeyRegister = require('../WakandaApiKeyRegister');
let HerokuSecurityUpdater = require('../heroku/HerokuSecurityUpdater');
let HerokuRequestSender = require('../heroku/HerokuRequestSender');
let crypto = require('crypto');

class ProjectCreator {

    constructor(requestSender, projectRepository) {
        this._requestSender = requestSender;
        this._projectRepository = projectRepository;

        this._createApiKey = function (wakandaData) {
            return crypto.createHash('md5').update(JSON.stringify(wakandaData.name)).digest('hex');
        };
    }

    createProject(wakandaInstanceData) {
        let herokuRequestSender = new HerokuRequestSender(wakandaInstanceData.herokuauth, this._requestSender);
        let herokuAppGenerator = new HerokuAppGenerator(herokuRequestSender);

        var context = this;
        herokuAppGenerator.generate({
            company: wakandaInstanceData.company,
            name: wakandaInstanceData.name,
            decryptKey: wakandaInstanceData.decryptKey,
            securityToken: wakandaInstanceData.securityToken
        }, function (appName, url) {
            context.proceedProjectCreation(appName, url, wakandaInstanceData);
        });
    }

    proceedProjectCreation(appName, url, wakandaData) {
        console.log('Proceding with project creation ' + url);
        wakandaData.decryptKey = RandomAsciiStringGenerator.randomAsciiString(8);

        new HerokuSecurityUpdater(this._requestSender).configureSecurity(wakandaData.decryptKey, appName);
        new HerokuDatabaseConfigurator(this._requestSender).configureMongo(appName);

        wakandaData.url = url;
        wakandaData.apiKey = this._createApiKey(wakandaData);

        this._projectRepository.saveProject(wakandaData);
        new WakandaApiKeyRegister(this._requestSender).registerApiKey(wakandaData);
    }
}

class RandomAsciiStringGenerator {};

RandomAsciiStringGenerator.randomAsciiString = function(length) {
    return RandomAsciiStringGenerator.randomString(length,'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
};

RandomAsciiStringGenerator.randomString = function(length, chars) {
    if (!chars) {
        throw new Error('Argument \'chars\' is undefined');
    }

    let charsLength = chars.length;
    if (charsLength > 256) {
        throw new Error('Argument \'chars\' should not have more than 256 characters'
            + ', otherwise unpredictability will be broken');
    }

    let randomBytes = crypto.randomBytes(length);
    let result = new Array(length);

    let cursor = 0;
    for (let i = 0; i < length; i++) {
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength];
    }

    return result.join('');
};

module.exports = ProjectCreator;
