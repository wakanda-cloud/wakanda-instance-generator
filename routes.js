'use strict';
let wakandaProjectStorage = require('./app/repository/WakandaProjectStorage');
let HerokuAppGenerator = require('./app/heroku/HerokuAppGenerator');
let ProjectCreator = require('./app/project/ProjectCreator');
let WakandaAuthenticator = require('./app/WakandaAuthenticator');
let ProjectRemover = require('./app/project/ProjectRemover');

let routes = function() {};
routes.injectRequestSender = function(requestSender) {
    routes.requestSender = requestSender;
};

routes.deleteProject = function (req, res) {
    var onError = function(status) {
        res.status(status).send("Authentication error");
    };

    let email = req.query.email;
    let apiKey = req.query.apiKey;
    let token = req.query.token;

    new WakandaAuthenticator(routes.requestSender).authenticate(email, token, function() {
        let projectRemover = new ProjectRemover(routes.requestSender, wakandaProjectStorage);
        projectRemover.removeProject(email, apiKey, req.query.herokuauth);
    }, onError);

    res.status(202).send();
};

routes.projects = function (req ,res) {
    console.log("routes.js => Fetching projects");
    var onError = function(status) {
        console.log('I got some status from email : ' +req.query.email+ ' status: ' + status);
        res.status(status).send();
    };

    console.log('I will see the email: ' + req.query.email);
    new WakandaAuthenticator(routes.requestSender).authenticate(req.query.email, req.query.token, function() {
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
        programmingLanguage: req.body.programmingLanguage
    };
    console.log(JSON.stringify(wakandaInstanceData));

    let projectCreator = new ProjectCreator(routes.requestSender, wakandaProjectStorage);
    projectCreator.createProject(wakandaInstanceData, req.body.herokuauth);
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

    new WakandaAuthenticator(routes.requestSender).authenticate(req.body.ownerEmail, req.body.token, function() {
        res.status(202).send();
        routes.goGenerate(req, res);
    }, onError);
};

module.exports = routes;
