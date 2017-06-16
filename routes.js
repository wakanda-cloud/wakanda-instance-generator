'use strict';

var routes = function(){};
var crypto = require('crypto');
var timers = require('timers');

var HerokuAppGenerator = require('./app/HerokuAppGenerator');
var HerokuSecurityUpdater = require('./app/HerokuSecurityUpdater');
var HerokuRedisConfigurator = require('./app/HerokuRedisConfigurator');
var WakandaProjectStorage = require('./app/WakandaProjectStorage');

routes.generate = function(req, res) {
    if(!req.body.name) {
        res.status(400).send("App name is necessary");
        return;
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
        appName : wakandaInstanceData.name,
        decryptKey: wakandaInstanceData.decryptKey,
        securityToken: wakandaInstanceData.securityToken
    });

    var loop = setInterval(function() {
        let whenAppCreated = function() {
            new HerokuRedisConfigurator().configureRedis(wakandaInstanceData.name);
            clearInterval(loop);
        };

        new HerokuAppGenerator().verifyAppCreated(wakandaInstanceData.name, whenAppCreated);
    }, 1000);

    new WakandaProjectStorage().save(wakandaInstanceData);
    res.status(200).send();
};

function getJsonData(data, res) {
    if(process.env.SECURITY_TOKEN) {
        var jsonData = securityService.decryptJSON(data);
        if(jsonData.token !== process.env.SECURITY_TOKEN) {
            res.status(401).send("Unauthorized");
        }
        return jsonData;
    }
    return JSON.parse(data);
}

module.exports = routes;
