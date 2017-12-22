var ProjectRepository = require('../app/repository/ProjectRepository');

class ProjectRepositoryMock extends ProjectRepository {

    saveProject(wakandaInstanceData) {
        this._saveProjectData = wakandaInstanceData;
    }

    get saveProjectData() {
        return this._saveProjectData;
    }

    fetchProjects() {

    }

    deleteProject() {

    }

    findProjectByApiKey() {

    }
}

module.exports = ProjectRepositoryMock;