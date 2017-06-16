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
}

module.exports = WakandaProjectStorage;