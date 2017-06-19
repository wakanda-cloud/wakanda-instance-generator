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
    new HerokuSecurityUpdater().configureSecurity(wakandaData.decryptKey, wakandaData.securityToken, appName);
    new HerokuRedisConfigurator().configureRedis(appName);

    wakandaData.url = url;
    wakandaData.apiKey = ProjectCreator._createApiKey(wakandaData);

    new WakandaProjectStorage().saveProject(wakandaData);
    new WakandaApiKeyRegister().registerApiKey(wakandaData);
};

ProjectCreator._createApiKey = function (wakandaData) {
    return crypto.createHash('md5').update(JSON.stringify(wakandaData.name)).digest('hex');
};

module.exports = ProjectCreator;
