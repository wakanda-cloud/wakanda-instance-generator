var request = require('request');
var CryptoJS = require('crypto-js');
const endpoint = function(resource) { return 'http://localhost:6000/' + resource };

var serverInstance;
var redisMemoryClient;

describe('Project Creation', function () {

    beforeAll(function(done) {
        process.env.REDIS_MEMORY = 1;
        process.env.TEST_ENVIRONMENT = 1;
        process.env.PORT = 6000;
        process.env.ENCRYPT_KEY = '12345678';
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

        redisMemoryClient = require('../app/repository/RedisConnector');

        serverInstance = require('../server').run(function() {
            setTimeout(done, 1000);
        });
    });

    afterAll(function(done) {
       serverInstance.close(done);
    });

    it('sandbox', function (done) {
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
});

function addFakeProject(email, wakandaData) {
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