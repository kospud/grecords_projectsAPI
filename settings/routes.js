
import { getAllUsers, signup } from '../controller/userController.js'

export const routes = (app) => {

    app
        .route('/users')
        .get(getAllUsers);

    app
        .route('/auth/signup')
        .post(signup);
}