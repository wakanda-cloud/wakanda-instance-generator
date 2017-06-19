'use strict';

let routes = function(){};

let WakandaProjectStorage = require('./app/WakandaProjectStorage');
let HerokuAppGenerator = require('./app/HerokuAppGenerator');
let ProjectCreator = require('./app/ProjectCreator');
let WakandaAuthenticator = require('./app/WakandaAuthenticator');
let WakandaApiKeyRegister = require('./app/WakandaApiKeyRegister');

routes.deleteProject = function (req, res) {
    var onError = function(status) {
        res.status(status).send("Authentication error");
    };

    let email = req.query.email;
    let apiKey = req.query.apiKey;
    let token = req.query.token;

    new WakandaAuthenticator().authenticate(email, token, function() {
        let wakandaProjectStorage = new WakandaProjectStorage();
        wakandaProjectStorage.findProjectByApiKey(email, apiKey, function(project) {
            let appName = wakandaProjectStorage.getAppName(project);
            new WakandaProjectStorage().deleteProject(email, appName);
            new WakandaApiKeyRegister().unregisterApp(apiKey);
            new HerokuAppGenerator().delete(appName);
        });
    }, onError);

    res.status(202).send();
};

routes.projects = function (req ,res) {
    var onError = function(status) {
        res.status(status).send();
    };

    new WakandaAuthenticator().authenticate(req.query.email, req.query.token, function() {
        let wakandaProjectStorage = new WakandaProjectStorage();
        wakandaProjectStorage.fetchProjects(req.query.email, function(projects) {
            if(!projects || projects.length === 0) {
                res.status(204).send();
            } else {
                res.status(200).send(projects);
            }
        });
    }, onError);
};

routes.goGenerate = function (req, res) {
    let wakandaInstanceData = {
        ownerEmail: req.body.ownerEmail,
        company: req.body.company,
        name: req.body.name,
        decryptKey: req.body.decryptKey,
        securityToken: req.body.securityToken,
        zipcode: req.body.zipcode,
        country: req.body.country,
        city: req.body.city,
        programmingLanguage: req.body.programmingLanguage,

    };
    console.log(JSON.stringify(wakandaInstanceData));

    ProjectCreator.createProject(wakandaInstanceData);
};

routes.generate = function(req, res) {
    if(!req.body.name) {
        res.status(400).send("App name is necessary");
        return;
    }
    process.env.herokuauth = 'Bearer 407b8340-103b-4cfb-b3d3-825938c8cb99';
    if(!process.env.herokuauth) {
        res.status(500).send("Auth not configured for this server");
        throw "Heroku Auth (key:herokuauth) not configured for this server";
    }

    var onError = function(status) {
        res.status(status).send();
    };

    new WakandaAuthenticator().authenticate(req.body.ownerEmail, req.body.token, function() {
        routes.goGenerate(req, res);
    }, onError);

    res.status(202).send();
};

module.exports = routes;
