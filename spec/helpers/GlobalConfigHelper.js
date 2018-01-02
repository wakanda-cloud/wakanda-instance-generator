console.log('Loading GlobalConfigHelper.js');
if (!process.env.REDIS_TRAVIS) {
    process.env.REDIS_MEMORY = 1;
}
process.env.TEST_ENVIRONMENT = 1;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
process.env.WAKANDA_STATISTIC_RECEIVER = 'https://wakanda-statistic-receiver.herokuapp.com';