'use strict';

let routes = function(){};

let WakandaProjectStorage = require('./app/WakandaProjectStorage');
let ProjectCreator = require('./app/ProjectCreator');

routes.projects = function (req ,res) {
    let wakandaProjectStorage = new WakandaProjectStorage();
    wakandaProjectStorage.fetchProjects(req.query.email, function(projects) {
        if(!projects || projects.length === 0) {
            res.status(204).send();
        } else {
            res.status(200).send(projects);
        }
    });
};

routes.generate = function(req, res) {
    if(!req.body.name) {
        res.status(400).send("App name is necessary");
        return;
    }

    if(!process.env.herokuauth) {
        res.status(500).send("Auth not configured for this server");
        throw "Heroku Auth (key:herokuauth) not configured for this server";
    }

    let wakandaInstanceData = {
        ownerEmail: req.body.ownerEmail,
        company: req.body.company,
        name: req.body.name,
        decryptKey: req.body.decryptKey,
        securityToken: req.body.securityToken,
        zipcode: req.body.zipcode,
        country: req.country,
        city: req.city
    };
    console.log(JSON.stringify(wakandaInstanceData));

    ProjectCreator.createProject(req);

    res.status(202).send();
};

routes.createProject = function (req) {

};

module.exports = routes;
