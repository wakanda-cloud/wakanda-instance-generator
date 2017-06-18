'use strict';

let routes = function(){};
let crypto = require('crypto');
let timers = require('timers');

let HerokuAppGenerator = require('./app/HerokuAppGenerator');
let HerokuSecurityUpdater = require('./app/HerokuSecurityUpdater');
let HerokuRedisConfigurator = require('./app/HerokuRedisConfigurator');
let WakandaProjectStorage = require('./app/WakandaProjectStorage');
let WakandaApiKeyRegister = require('./app/WakandaApiKeyRegister');

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
        zipcode : req.body.zipcode,
        country : req.country,
        city : req.city
    };

    console.log(JSON.stringify(wakandaInstanceData));

    new HerokuAppGenerator().generate({
        company: wakandaInstanceData.company,
        appName : wakandaInstanceData.name,
        decryptKey: wakandaInstanceData.decryptKey,
        securityToken: wakandaInstanceData.securityToken
    }, function(url) {
        let loop = setInterval(function () {
            let whenAppCreated = function () {
                new HerokuRedisConfigurator().configureRedis(wakandaInstanceData.name);
                clearInterval(loop);
            };

            let whenErrorHappens = function () {
                clearInterval(loop);
            };

            new HerokuAppGenerator().verifyAppCreated(wakandaInstanceData.name, whenAppCreated, whenErrorHappens);
        }, 1000);

        new WakandaProjectStorage().save(wakandaInstanceData);
        new WakandaApiKeyRegister().register(wakandaInstanceData);
    });

    res.status(200).send();
};

module.exports = routes;
