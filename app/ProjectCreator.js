'use strict';

let HerokuAppGenerator = require('./HerokuAppGenerator');
let HerokuRedisConfigurator = require('./HerokuRedisConfigurator');
let WakandaApiKeyRegister = require('./WakandaApiKeyRegister');
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

ProjectCreator.proceedProjectCreation = function (appName, url, wakandaInstanceData) {
    new HerokuRedisConfigurator().configureRedis(appName);

    wakandaInstanceData.url = url;
    new WakandaProjectStorage().saveProject(wakandaInstanceData);
    new WakandaApiKeyRegister().registerApiKey(wakandaInstanceData);
};

module.exports = ProjectCreator;
