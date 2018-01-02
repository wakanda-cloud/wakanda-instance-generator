var HerokuRequestSender = require('../heroku/HerokuRequestSender');
var WakandaApiKeyRegister = require('../WakandaApiKeyRegister');
var AppNameGenerator = require('../project/AppNameGenerator');

var HerokuAppGenerator = require('../heroku/HerokuAppGenerator');

class ProjectRemover {

    constructor(requestSender, wakandaProjectStorage) {
        this.requestSender = requestSender;
        this.wakandaProjectStorage = wakandaProjectStorage;
    }

    removeProject(email, apiKey, herokuauth) {
        console.log('Removing project ' + apiKey + ' from email ' + email + ' with herokuauth ' + herokuauth);
        var self = this;
        this.wakandaProjectStorage.findProjectByApiKey(email, apiKey, function(project) {
            let herokuAppGenerator = new HerokuAppGenerator(new HerokuRequestSender(herokuauth, self.requestSender));
            let wakandaApiKeyRegister = new WakandaApiKeyRegister(self.requestSender);
            let appName = AppNameGenerator.extractAppNameFromUrl(project.url);

            self.wakandaProjectStorage.deleteProject(email, appName);
            wakandaApiKeyRegister.unregisterApp(apiKey);
            herokuAppGenerator.delete(appName);
        });
    }
}

module.exports = ProjectRemover;