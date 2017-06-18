'use strict';

let HerokuAppGenerator = require('./HerokuAppGenerator');
let HerokuRedisConfigurator = require('./HerokuRedisConfigurator');
let WakandaApiKeyRegister = require('./WakandaApiKeyRegister');
let HerokuSecurityUpdater = require('./HerokuSecurityUpdater');
let WakandaProjectStorage = require('./WakandaProjectStorage');

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
    new WakandaProjectStorage().saveProject(wakandaData);
    new WakandaApiKeyRegister().registerApiKey(wakandaData);
};

module.exports = ProjectCreator;
