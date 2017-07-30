'use strict';

var redis = require('./RedisConnector');
var CryptoJS = require('crypto-js');
var AppNameGenerator = require('./utils/AppNameGenerator');

class WakandaProjectStorage {

    saveProject(wakandaInstanceData) {
        redis.get(wakandaInstanceData.ownerEmail, function (error, data) {
            let arrayData = data ? JSON.parse(data) : [];
            arrayData.push(wakandaInstanceData);
            redis.set(wakandaInstanceData.ownerEmail, JSON.stringify(arrayData));
        })
    }

    fetchProjects(email, callback) {
        let generateTokenSearchAPI = function (project) {
            let filter = JSON.stringify({client: "*"});
            let token = CryptoJS.AES.encrypt(filter, project.decryptKey, {mode: CryptoJS.mode.CTR}).toString();
            token = token.split("+").join("%2B");
            return token;
        };

        let buildLinkAPISearch = function(project) {
            let token = generateTokenSearchAPI(project);
            let appName = AppNameGenerator.buildAppName(project.company, project.name);
            return AppNameGenerator.buildAppUrl(appName) + "/listStatistics?payload=" + token;
        };

        redis.get(email, function (error, projectsJsonStringified) {
            let projectsArray = JSON.parse(projectsJsonStringified);
            projectsArray.forEach(function(project) {
                project.linkSearchAPI = buildLinkAPISearch(project);
            });
            callback.call(this, JSON.stringify(projectsArray));
        });
    }

    findProjectByApiKey(email, apiKey, onDone) {
        redis.get(email, function (error, data) {
            let arrayData = data ? JSON.parse(data) : [];
            arrayData.forEach(function (element, index) {
                if(element.apiKey === apiKey) {
                    onDone.call(this, element);
                }
            });
        });
    }

    deleteProject(email, appName) {
        var context = this;
        redis.get(email, function (error, data) {
            let arrayData = data ? JSON.parse(data) : [];
            let newArrayData = [];

            arrayData.forEach(function(element, index) {
                let appNameFound = context.getAppName(element);
                if(appNameFound !== appName) {
                    newArrayData.push(element);
                }
            });

            redis.set(email, JSON.stringify(newArrayData));
        })
    }

    getAppName(wakandaInstanceData) {
        return wakandaInstanceData.url.split("\.herokuapp\.com")[0].replace("https://", "");
    }
}

module.exports = WakandaProjectStorage;