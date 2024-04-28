
import { getProjects, getProject, getProjectsByType, addProject } from '../controller/projectController.js';
import { getAllUsers, signin, signup } from '../controller/userController.js'
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
        .get(passport.authenticate("jwt", { session: false }), getProjects)

    app
        .route('/projects')
        .post(passport.authenticate("jwt", { session: false }), addProject)

    app
        .route('/projects/:id')
        .get(passport.authenticate("jwt", { session: false }), getProject)

    app
        .route('/projects/bytype/:type')
        .get(passport.authenticate("jwt", { session: false }), getProjectsByType)
}