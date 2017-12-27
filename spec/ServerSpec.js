var request = require('request');
var crypto = require('crypto');
var CryptoJS = require('crypto-js');
var RequestSenderFake = require('./RequestSenderFake');
let server = require('../server');
const endpoint = function(resource) { return 'http://localhost:6000/' + resource };

var serverInstance;
var redisMemoryClient;

var requestSenderMock;
describe('API endpoints', function () {

    beforeAll(function(done) {
        process.env.PORT = 6000;

        process.env.ENCRYPT_KEY = '12345678';

        redisMemoryClient = require('../app/repository/RedisConnector');
        requestSenderMock = new RequestSenderFake();
        serverInstance = server.run(function() {
            setTimeout(done, 1000);
        }, requestSenderMock);
    });

    beforeEach(function() {
       requestSenderMock.reset();
    });

    afterAll(function(done) {
       serverInstance.close(done);
    });

    it('should retrieve projects from redis with all fields', function (done) {
        var expectedProject = addFakeProject("email@gmail.com", {
            ownerEmail: "email@gmail.com",
            company: "Beyond Logic",
            name: "SpaceX",
            decryptKey: "12345678",
            securityToken: "b2@fGt4",
            zipcode: "88089-004",
            country: "Mars",
            city: "North",
            programmingLanguage: "Matrix"
        });
        requestSenderMock.responseStatus(200);
        request.get(endpoint('projects?email=email@gmail.com'), function(error, response) {
            if(error) throw error;

            let firstProject = JSON.parse(response.body)[0];
            let expectedLinkSearchAPI = 'https://beyondlogic-spacex.herokuapp.com/listStatistics?payload=';

            assertRegisteredProjectWithData(expectedProject, firstProject);
            expect(firstProject.linkSearchAPI.indexOf(expectedLinkSearchAPI) > -1).toBe(true);
            done();
        });
    });

    it('should return star (*) encrypted with project decryptKey as payload value when fetch projects without filter', function(done) {
        var expectedProject = addFakeProject("email@gmail.com", {
            ownerEmail: "email@gmail.com",
            company: "Beyond Logic",
            name: "SpaceX",
            decryptKey: "09abt4de"
        });

        requestSenderMock.responseStatus(200);

        request.get(endpoint('projects?email=email@gmail.com'), function(error, response) {
            if(error) throw error;

            let project = JSON.parse(response.body)[0];

            let split = project.linkSearchAPI.split('payload=')[1].replace('%2B', '+');
            var bytes = CryptoJS.AES.decrypt(split, expectedProject.decryptKey, {
                mode: CryptoJS.mode.CTR
            });

            expect({client:'*'}).toEqual(JSON.parse(bytes.toString(CryptoJS.enc.Utf8)));
            done();
        });
    });

    it('should not fetch projects when authentication token is invalid', function(done) {
        requestSenderMock.responseStatus(401);
        request.get(endpoint('projects?email=email@gmail.com&token=b0d5FgE'), function(error, response) {
            if(error) throw error;
            expect('GET').toEqual(requestSenderMock.options.method);
            expect('https://wakanda-security.herokuapp.com/verifyToken?email=email@gmail.com&token=b0d5FgE').toEqual(requestSenderMock.options.url);
            expect(401).toEqual(response.statusCode);
            done();
        });

    });

    it('should return 204 NO CONTENT when not find projects for specified email', function(done) {
        requestSenderMock.responseStatus(200);
        request.get(endpoint('projects?email=withoutprojects@gmail.com&token=b0d5FgE'), function(error, response) {
            if(error) throw error;
            expect(204).toEqual(response.statusCode);
            done();
        });
    });

    it('should delete project from either redis and heroku, and unregister API Key on Wakanda Statistic Receiver', function(done) {
        let apiKey = crypto.createHash('md5').update(JSON.stringify('spacex')).digest('hex');
        addFakeProject("email@gmail.com", {
            ownerEmail: "email@gmail.com",
            company: "Beyond Logic",
            name: "SpaceX",
            decryptKey: "09abt4de",
            apiKey: apiKey,
            url: 'https://beyondlogic-spacex.herokuapp.com/'
        });

        requestSenderMock.responseStatus(200);
        request.del(endpoint('projects?herokuauth=60504-031b0-33413&email=email@gmail.com&apiKey=' + apiKey), function(err, response) {
            if(err) throw err;
            expect('http://wakanda-statistic-receiver.herokuapp.com/apikey').toEqual(requestSenderMock.options[1].url);
            expect('DELETE').toEqual(requestSenderMock.options[1].method);
            expect('https://api.heroku.com/apps/beyondlogic-spacex').toEqual(requestSenderMock.options[2].url);
            expect('Bearer 60504-031b0-33413').toEqual(requestSenderMock.options[2].headers.Authorization);
            expect('DELETE').toEqual(requestSenderMock.options[2].method);
            expect(202).toEqual(response.statusCode);
            done();
        });
    });

    it('should validate authentication token when delete project', function(done) {
        let apiKey = crypto.createHash('md5').update(JSON.stringify('spacex')).digest('hex');
        addFakeProject("unauthorized@gmail.com", {
            ownerEmail: "unauthorized@gmail.com",
            company: "Beyond Logic",
            name: "SpaceX",
            decryptKey: "09abt4de",
            apiKey: apiKey,
            url: 'https://beyondlogic-spacex.herokuapp.com/'
        });

        requestSenderMock.responseStatus(200);

        request.del(endpoint('projects?email=unauthorized@gmail.com&token=b0d5FgE&apiKey=' + apiKey), function(err, response) {
            if(err) throw err;
            expect('GET').toEqual(requestSenderMock.options[0].method);
            expect('https://wakanda-security.herokuapp.com/verifyToken?email=unauthorized@gmail.com&token=b0d5FgE').toEqual(requestSenderMock.options[0].url);
            expect('http://wakanda-statistic-receiver.herokuapp.com/apikey').toEqual(requestSenderMock.options[1].url);
            expect('https://api.heroku.com/apps/beyondlogic-spacex').toEqual(requestSenderMock.options[2].url);
            done();
        });
    });

    it('should not delete project when authentication token is not valid', function(done) {
        let apiKey = crypto.createHash('md5').update(JSON.stringify('spacex')).digest('hex');

        requestSenderMock.responseStatus(401);

        request.del(endpoint('projects?herokuauth=60504-031b0-33413&token=b0d5FgE&email=email@gmail.com&apiKey=' + apiKey), function(err, response) {
            if(err) throw err;

            expect('GET').toEqual(requestSenderMock.options.method);
            expect('https://wakanda-security.herokuapp.com/verifyToken?email=email@gmail.com&token=b0d5FgE').toEqual(requestSenderMock.options.url);
            expect(undefined).toEqual(requestSenderMock.options[1]);
            done();
        });
    });

    it('should return status 202 when request be accepted and project will be generated', function(done) {
        requestSenderMock.responseStatus(200);

        request.post({
            url: endpoint('generate'),
            headers: {'Content-Type' : 'application/json'},
            json: {
                ownerEmail: 'email@gmail.com',
                token: 'B@D40fGe4',
                name:'beyondlogic',
                company: 'Wakanda',
                securityToken: 'B0835@34'
            }
        }, function(err, response) {
            if(err) throw err;
            expect(202).toEqual(response.statusCode);
            setTimeout(function() {//wait redis save data assyncrhonously
                redisMemoryClient.get('email@gmail.com', function(err, data) {
                    console.log('*************************' + data);
                    expect('email@gmail.com').toEqual(JSON.parse(data)[0].ownerEmail);
                    expect('beyondlogic').toEqual(JSON.parse(data)[0].name);
                    expect('Wakanda').toEqual(JSON.parse(data)[0].company);
                    expect('B0835@34').toEqual(JSON.parse(data)[0].securityToken);
                    done();
                });
            }, 500);



        })
    });

    it('should return 400 when app name not configurated', function(done) {
        requestSenderMock.responseStatus(200);

        request.post({
            url: endpoint('generate'),
            headers: {'Content-Type' : 'application/json'},
            json: {
            }
        }, function(err, response) {
            if(err) throw err;
            expect(400).toEqual(response.statusCode);
            done();
        })
    });

    it('should return 401 when authentication fails', function(done) {
        requestSenderMock.responseStatus(401);

        request.post({
            url: endpoint('generate'),
            headers: {'Content-Type' : 'application/json'},
            json: {
                name:'beyondlogic'
            }
        }, function(err, response) {
            if(err) throw err;
            expect(401).toEqual(response.statusCode);
            done();
        })
    });
});

function addFakeProject(email, wakandaData) {
    console.log(email + ' added ');
    redisMemoryClient.set(email, JSON.stringify([wakandaData]));
    return wakandaData;
}

function assertRegisteredProjectWithData(project, firstProject) {
    expect(project.ownerEmail).toEqual(firstProject.ownerEmail);
    expect(project.company).toEqual(firstProject.company);
    expect(project.name).toEqual(firstProject.name);
    expect(project.decryptKey).toEqual(firstProject.decryptKey);
    expect(project.securityToken).toEqual(firstProject.securityToken);
    expect(project.zipcode).toEqual(firstProject.zipcode);
    expect(project.country).toEqual(firstProject.country);
    expect(project.city).toEqual(firstProject.city);
    expect(project.programmingLanguage).toEqual(firstProject.programmingLanguage);
}