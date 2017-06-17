'use strict';

var redis = require('./RedisConnector');

class WakandaProjectStorage {

    save(wakandaInstanceData) {
        redis.get(wakandaInstanceData.ownerEmail, function (data) {
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
}

module.exports = WakandaProjectStorage;