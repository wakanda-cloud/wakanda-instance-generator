'use strict';

class AppNameGenerator {
}

AppNameGenerator.buildAppName = function (company, projectName) {
    let appName = company.replace(' ', '').replace(/[^a-zA-Z0-9]/g, '').trim().toLowerCase();
    appName = appName + "-";
    return appName + projectName.replace(' ', '').replace(/[^a-zA-Z0-9]/g, '').trim().toLowerCase();
};

AppNameGenerator.buildAppUrl = function (appName) {
    return "https://" + appName + ".herokuapp.com";
};

module.exports = AppNameGenerator;
