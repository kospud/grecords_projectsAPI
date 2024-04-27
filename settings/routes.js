
import { getAllUsers, signin, signup } from '../controller/userController.js'
import passport from 'passport';


export const routes = (app) => {

    app
        .route('/users')
        .get(passport.authenticate("jwt",{session: false}),getAllUsers);

    app
        .route('/auth/signup')
        .post(signup);
    
    app
    .route('/auth/signin')
    .get(signin)
}