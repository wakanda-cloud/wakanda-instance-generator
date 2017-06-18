'use strict';

let routes = function(){};

let WakandaProjectStorage = require('./app/WakandaProjectStorage');
let HerokuAppGenerator = require('./app/HerokuAppGenerator');
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
    process.env.herokuauth = 'Bearer 407b8340-103b-4cfb-b3d3-825938c8cb99';
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
        country: req.body.country,
        city: req.body.city

    };
    console.log(JSON.stringify(wakandaInstanceData));

    ProjectCreator.createProject(wakandaInstanceData);

    res.status(202).send();
};

routes.createProject = function (req) {

};

module.exports = routes;
