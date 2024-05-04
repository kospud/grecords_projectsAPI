
import { getProject, getProjectsByType, addProject, updateProject, removeProject } from '../controller/projectController.js';
import { getAllUsers, signin, signup } from '../controller/userController.js'
import { getStage, getStages, getUsersStages, updateStage } from '../controller/stagesController.js'
import passport from 'passport';


export const routes = (app) => {

    app
        .route('/users')
        .get(passport.authenticate("jwt", { session: false }), getAllUsers);

    app
        .route('/auth/signup')
        .post(passport.authenticate("jwt", { session: false }), signup);

    app
        .route('/auth/signin')
        .get(signin)

    app
        .route('/projects')
        .post(passport.authenticate("jwt", { session: false }), addProject)

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
        .route('/stages/:project/:task')
        .put(passport.authenticate("jwt", { session: false }), updateStage)
}