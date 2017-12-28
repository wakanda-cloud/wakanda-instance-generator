let ProjectCreator = require('../app/project/ProjectCreator');
let HerokuRequestSender = require('../app/heroku/HerokuRequestSender');
let RequestSenderMock = require('./RequestSenderFake');
let ProjectRepositoryMock = require('./ProjectRepositoryMock');
var CryptoJS = require("crypto-js");

describe('Project Creation', function () {

    const herokuauth = 'bc4318943a-43036c3d-4319c4-3413cc';

    var projectCreatorInstance;
    var requestMock;
    var repositoryMock;

    beforeEach(function () {
        requestMock = new RequestSenderMock();
        repositoryMock = new ProjectRepositoryMock();
        projectCreatorInstance = new ProjectCreator(requestMock, repositoryMock);
        process.env.ENCRYPT_KEY = '12345678';
    });

    it('app name should be concatenation from company and project name in lower case ignoring special characters and white spaces', function() {
        let data = {
            company: 'Cómpany',
            name: 'The Chosen @ne'
        };

        projectCreatorInstance.createProject(data, herokuauth);
        var requestBody = requestMock.options;
        var appName = JSON.parse(requestBody.body).app.name;

        expect('cmpany-thechosenne').toEqual(appName)
    });

    it('should fire heroku project creation with received herokuauth on header with correct content type and accept rule', function () {
        let data = getDefaultWakandaInstanceData();

        projectCreatorInstance.createProject(data, herokuauth);

        expect('application/json').toEqual(requestMock.options.headers['Content-Type']);
        expect('application/vnd.heroku+json; version=3').toEqual(requestMock.options.headers['Accept']);
        expect('Bearer ' + herokuauth).toEqual(requestMock.options.headers['Authorization']);
    });

    it('should fire heroku project creation with all  correct request parameters', function() {
        let data = {
            company: 'Wakanda',
            name: 'ProjectCreationSpec',
            decryptKey: '09uyIoT4',
            securityToken: 'B0835@34'
        };

        projectCreatorInstance.createProject(data, herokuauth);

        let expectHerokuRequest = {
            url: 'https://api.heroku.com/app-setups',
            method: 'POST',
            headers: herokuHeader(herokuauth),
            body: JSON.stringify({
                app : {
                    name: 'wakanda-projectcreationspec'
                },
                source_blob: {
                    url: "https://github.com/wakanda-cloud/wakanda/tarball/v2.0"
                }
            })
        };

        expect(expectHerokuRequest).toEqual(requestMock.options);
    });

    it('should call configure security after project creation', function() {
        let data = getDefaultWakandaInstanceData();
        requestMock.responseStatus(200);
        projectCreatorInstance.createProject(data, herokuauth);

        var expected = {
            url: 'https://api.heroku.com/apps/wakanda-projectcreationspec/config-vars',
            method: 'PATCH',
            headers: herokuHeader(herokuauth),
            body: '{ \"DECRYPT_KEY\":\"' + data.decryptKey + '\" }'
        };

        expect(expected.url).toEqual(requestMock.options[1].url);
        expect(expected.method).toEqual(requestMock.options[1].method);
        expect(expected.body).toEqual(requestMock.options[1].body);
        expect(expected.headers).toEqual(requestMock.options[1].headers);
    });

    it('should configure database after security configuration with correct data', function() {
        let data = getDefaultWakandaInstanceData();
        requestMock.responseStatus(200);
        projectCreatorInstance.createProject(data, herokuauth);

        var expectedBody = {
            url: 'https://api.heroku.com/apps/wakanda-projectcreationspec/addons',
            method: 'POST',
            headers: herokuHeader(herokuauth),
            body: '{  \"plan\": \"mongolab:sandbox\" }'
        };

        expect(expectedBody).toEqual(requestMock.options[2]);
        expect('https://wakanda-projectcreationspec.herokuapp.com').toEqual(repositoryMock.saveProjectData.url);
        expect(projectCreatorInstance._createApiKey(data)).toEqual(repositoryMock.saveProjectData.apiKey);
    });

    it('should encrypt wakandaInstanceData with process.env.ENCRYPT_KEY to send request', function() {
        let data = getDefaultWakandaInstanceData();
        requestMock.responseStatus(200);
        projectCreatorInstance.createProject(data, herokuauth);

        let apiKeyRegisterRequest = requestMock.options[3];
        expect('https://wakanda-statistic-receiver.herokuapp.com/apikey').toEqual(apiKeyRegisterRequest.url);
        expect('POST').toEqual(apiKeyRegisterRequest.method);

        var bytes = CryptoJS.AES.decrypt(apiKeyRegisterRequest.json.wakandaInstanceData, process.env.ENCRYPT_KEY, {
            mode: CryptoJS.mode.CTR
        });

        expect(data).toEqual(JSON.parse(bytes.toString(CryptoJS.enc.Utf8)));
    });
});

function getDefaultWakandaInstanceData() {
    let data = {
        company: 'Wakanda',
        name: 'ProjectCreationSpec',
        decryptKey: '09uyIoT4',
        securityToken: 'B0835@34'
    };
    return data;
}

function herokuHeader(herokuauth) {
    return {
        'Content-Type' : 'application/json',
        'Accept' : 'application/vnd.heroku+json; version=3',
        'Authorization' : 'Bearer ' + herokuauth
    }
}

