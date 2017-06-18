'use strict';

let HerokuAppGenerator = require('./HerokuAppGenerator');
let HerokuRedisConfigurator = require('./HerokuRedisConfigurator');
let WakandaApiKeyRegister = require('./WakandaApiKeyRegister');
let WakandaProjectStorage = require('./WakandaProjectStorage');

class ProjectCreator {}

ProjectCreator.createProject = function (wakandaInstanceData) {
    new HerokuAppGenerator().generate({
        company: wakandaInstanceData.company,
        appName: wakandaInstanceData.name,
        decryptKey: wakandaInstanceData.decryptKey,
        securityToken: wakandaInstanceData.securityToken
    }, this.proceedProjectCreation);
};

ProjectCreator.proceedProjectCreation = function (wakandaInstanceData) {
    new HerokuRedisConfigurator().configureRedis(wakandaInstanceData.name);
    new WakandaProjectStorage().saveProject(wakandaInstanceData);
    new WakandaApiKeyRegister().registerApiKey(wakandaInstanceData);
};

module.exports = ProjectCreator;
