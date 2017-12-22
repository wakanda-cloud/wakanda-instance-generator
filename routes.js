'use strict';

let routes = function(){};

let wakandaProjectStorage = require('./app/repository/WakandaProjectStorage');
let requestSender = require('./app/RequestSender');

let HerokuAppGenerator = require('./app/heroku/HerokuAppGenerator');
let ProjectCreator = require('./app/project/ProjectCreator');
let WakandaAuthenticator = require('./app/WakandaAuthenticator');
let ProjectRemover = require('./app/project/ProjectRemover');

routes.deleteProject = function (req, res) {
    var onError = function(status) {
        res.status(status).send("Authentication error");
    };

    let email = req.query.email;
    let apiKey = req.query.apiKey;
    let token = req.query.token;

    new WakandaAuthenticator().authenticate(email, token, function() {
        let projectRemover = new ProjectRemover(requestSender, wakandaProjectStorage);
        projectRemover.removeProject(email, apiKey);
    }, onError);

    res.status(202).send();
};

routes.projects = function (req ,res) {
    var onError = function(status) {
        res.status(status).send();
    };

    new WakandaAuthenticator().authenticate(req.query.email, req.query.token, function() {
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

    let herokuRequestSender = new HerokuRequestSender(req.herokuauth, requestSender);
    let projectCreator = new ProjectCreator(herokuRequestSender, wakandaProjectStorage);
    projectCreator.createProject(wakandaInstanceData);
};

routes.generate = function(req, res) {
    if(!req.body.name) {
        res.status(400).send("App name is necessary");
        return;
    }
    //if(!process.env.herokuauth) {
        //res.status(500).send("Auth not configured for this server");
        //throw "Heroku Auth (key:herokuauth) not configured for this server";
    //}

    var onError = function(status) {
        res.status(status).send();
    };

    new WakandaAuthenticator().authenticate(req.body.ownerEmail, req.body.token, function() {
        routes.goGenerate(req, res);
    }, onError);

    res.status(202).send();
};

module.exports = routes;
