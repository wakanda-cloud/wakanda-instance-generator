'use strict';

let HerokuAppGenerator = require('./app/HerokuAppGenerator');
let HerokuRedisConfigurator = require('./app/HerokuRedisConfigurator');
let WakandaApiKeyRegister = require('./app/WakandaApiKeyRegister');
let WakandaProjectStorage = require('./app/WakandaProjectStorage');

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
