'use strict';

class AppNameGenerator {
}

AppNameGenerator.CONCATENATOR = "-"

AppNameGenerator.buildAppName = function (company, projectName) {
    let appName = company.replace(' ', '').replace(/[^a-zA-Z0-9]/g, '').trim().toLowerCase();
    appName = appName + AppNameGenerator.CONCATENATOR;
    return appName + projectName.replace(' ', '').replace(/[^a-zA-Z0-9]/g, '').trim().toLowerCase();
};

AppNameGenerator.buildAppUrl = function (appName) {
    return "https://" + appName + ".herokuapp.com";
};

AppNameGenerator.extractAppNameFromUrl = function(url) {
    return url.split("\.herokuapp\.com")[0].replace("https://", "");
};

module.exports = AppNameGenerator;
