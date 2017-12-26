var redisClient = null;

if (process.env.REDIS_URL) {
    redisClient = require('redis').createClient(process.env.REDIS_URL, {no_ready_check: true});
} else if (process.env.REDIS_MEMORY) {
    redisClient = require('redis-js').toNodeRedis().createClient();
} else {
    redisClient = require('redis').createClient();
}

redisClient.on('connect', function() {
    var environment = process.env.REDIS_URL ? 'production' : process.env.REDIS_MEMORY ? 'test environment' : 'developer';
    console.log('Redis %s environment connected', environment);
});

module.exports = redisClient;
