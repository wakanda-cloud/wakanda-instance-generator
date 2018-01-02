'use strict';

const ProjectRepository = require('./ProjectRepository');

var redis = require('./RedisConnector');
var CryptoJS = require('crypto-js');
var AppNameGenerator = require('../project/AppNameGenerator');

class WakandaProjectStorage extends ProjectRepository {

    saveProject(wakandaInstanceData) {
        console.log('Saving project app ' + wakandaInstanceData.name);
        redis.get(wakandaInstanceData.ownerEmail, function (error, data) {
            if(error) throw error;
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

        console.log('Will read projects from email: ' + email);
        redis.get(email, function (error, projectsJsonStringified) {
            if(error) throw error;
            let projectsArray = JSON.parse(projectsJsonStringified);

            if(projectsArray !== null) {
                projectsArray.forEach(function(project) {
                    project.linkSearchAPI = buildLinkAPISearch(project);
                });
                callback.call(this, JSON.stringify(projectsArray));
            } else {
                callback.call(this, null);
            }
        });
    }

    findProjectByApiKey(email, apiKey, onDone) {
        redis.get(email, function (error, data) {
            if(error) throw error;
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
                let appNameFound = context._getAppName(element);
                if(appNameFound !== appName) {
                    newArrayData.push(element);
                }
            });

            redis.set(email, JSON.stringify(newArrayData));
        })
    }

    _getAppName(wakandaInstanceData) {
        return AppNameGenerator.extractAppNameFromUrl(wakandaInstanceData.url);
    }
}

module.exports = new WakandaProjectStorage();