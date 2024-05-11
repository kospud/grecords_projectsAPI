
import { getProjects, getProject, getProjectsByType, addProject, updateProject, removeProject } from '../controller/projectController.js';
import { getAllUsers, getUser, signin, signup } from '../controller/userController.js'
import { getProjectReport, getStage, getStages, getStagesReport, getUserReport, getUsersStages, updateStage, updateStageStatus } from '../controller/stagesController.js'
import passport from 'passport';
import { getTemplate, getTemplates } from '../controller/templatesController.js';
import { getStatuses } from '../controller/StatusesController.js';


export const routes = (app) => {

    app
        .route('/users')
        .get(passport.authenticate("jwt", { session: false }), getAllUsers);

    app
        .route('/auth/signup')
        .post(passport.authenticate("jwt", { session: false }), signup);

    app
        .route('/auth/signin')
        .post(signin)

    app
        .route('/auth/user')
        .get(passport.authenticate("jwt", { session: false }), getUser);

    app
        .route('/projects')
        .post(passport.authenticate("jwt", { session: false }), addProject)

    app
        .route('/projects')
        .get(passport.authenticate("jwt", { session: false }), getProjects)

    app
        .route('/projects/:id')
        .get(passport.authenticate("jwt", { session: false }), getProject)

    app
        .route('/projects/:id')
        .put(passport.authenticate("jwt", { session: false }), updateProject)

    app
        .route('/projects/:id')
        .delete(passport.authenticate("jwt", { session: false }), removeProject)

    app
        .route('/projects/bytype/:type')
        .get(passport.authenticate("jwt", { session: false }), getProjectsByType)

    app
        .route('/stages')
        .get(passport.authenticate("jwt", { session: false }), getStages)

    app
        .route('/stages/byuser')
        .get(passport.authenticate("jwt", { session: false }), getUsersStages)

    app
        .route('/stages/:project/:task')
        .get(passport.authenticate("jwt", { session: false }), getStage)

    app
        .route('/stages/:project/:task/status')
        .put(passport.authenticate("jwt", { session: false }), updateStageStatus)

    app
        .route('/stages/:project/:task')
        .put(passport.authenticate("jwt", { session: false }), updateStage)

    app
        .route('/templates')
        .get(passport.authenticate("jwt", { session: false }), getTemplates)
    app
        .route('/templates/:id')
        .get(passport.authenticate("jwt", { session: false }), getTemplate)

    app.
        route('/statuses')
        .get(passport.authenticate('jwt', { session: false }), getStatuses)

    app
        .route('/reports/general')
        .get(passport.authenticate("jwt", { session: false }), getStagesReport)

    app
        .route('/reports/projects/:id')
        .get(passport.authenticate("jwt", { session: false }), getProjectReport)
    app
        .route('/reports/users/:id')
        .get(passport.authenticate("jwt", { session: false }), getUserReport)
}