'use strict';

var redis = require('./RedisConnector');

class WakandaProjectStorage {

    saveProject(wakandaInstanceData) {
        redis.get(wakandaInstanceData.ownerEmail, function (error, data) {
            let arrayData = data ? JSON.parse(data) : [];
            arrayData.push(wakandaInstanceData);
            redis.set(wakandaInstanceData.ownerEmail, JSON.stringify(arrayData));
        })
    }

    fetchProjects(email, callback) {
        redis.get(email, function (error, projects) {
            callback.call(this, projects);
        });
    }

    findProjectByApiKey(email, apiKey, onDone) {
        redis.get(email, function (error, data) {
            let arrayData = data ? JSON.parse(data) : [];
            arrayData.forEach(function (element, index) {
                if(element.apiKey === apiKey) {
                    onDone.call(this, element);
                    return;
                }
            });

            onDone.call(this, null);
        });
    }

    deleteProject(email, appName) {
        redis.get(email, function (error, data) {
            let arrayData = data ? JSON.parse(data) : [];
            let newArrayData = [];

            arrayData.forEach(function(element, index) {
                let appNameFound = this.getAppName(element);
                if(appNameFound !== appName) {
                    newArrayData.push(element);
                }
            });

            redis.set(email, JSON.stringify(arrayData));
        })
    }

    getAppName(wakandaInstanceData) {
        return wakandaInstanceData.url.substr(8, wakandaInstanceData.url.indexOf(".herokuapp.com"));
    }
}

module.exports = WakandaProjectStorage;