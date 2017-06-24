'use strict';

let HerokuAppGenerator = require('./HerokuAppGenerator');
let HerokuRedisConfigurator = require('./HerokuRedisConfigurator');
let WakandaApiKeyRegister = require('./WakandaApiKeyRegister');
let HerokuSecurityUpdater = require('./HerokuSecurityUpdater');
let WakandaProjectStorage = require('./WakandaProjectStorage');
let crypto = require('crypto');

class ProjectCreator {}

ProjectCreator.createProject = function (wakandaInstanceData) {
    new HerokuAppGenerator().generate({
        company: wakandaInstanceData.company,
        name: wakandaInstanceData.name,
        decryptKey: wakandaInstanceData.decryptKey,
        securityToken: wakandaInstanceData.securityToken
    }, function(appName, url) {
        ProjectCreator.proceedProjectCreation(appName, url, wakandaInstanceData);
    });
};

ProjectCreator.proceedProjectCreation = function (appName, url, wakandaData) {
    wakandaData.decryptKey = ProjectCreator._randomAsciiString(8);

    new HerokuSecurityUpdater().configureSecurity(wakandaData.decryptKey, appName);
    new HerokuRedisConfigurator().configureMongo(appName);

    wakandaData.url = url;
    wakandaData.apiKey = ProjectCreator._createApiKey(wakandaData);

    new WakandaProjectStorage().saveProject(wakandaData);
    new WakandaApiKeyRegister().registerApiKey(wakandaData);
};

ProjectCreator._randomAsciiString = function(length) {
    return ProjectCreator._randomString(length,'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
}

ProjectCreator._randomString = function(length, chars) {
    if (!chars) {
        throw new Error('Argument \'chars\' is undefined');
    }

    var charsLength = chars.length;
    if (charsLength > 256) {
        throw new Error('Argument \'chars\' should not have more than 256 characters'
            + ', otherwise unpredictability will be broken');
    }

    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);

    var cursor = 0;
    for (var i = 0; i < length; i++) {
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength];
    }

    return result.join('');
}


ProjectCreator._createApiKey = function (wakandaData) {
    return crypto.createHash('md5').update(JSON.stringify(wakandaData.name)).digest('hex');
};



module.exports = ProjectCreator;
