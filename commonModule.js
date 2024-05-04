import jsonwebtoken from 'jsonwebtoken'
import { jwtKey } from './settings/jwtKey.js'


export const getUserID = (token) => {

    const slicedToken = token.replace('Bearer ', '')

    let userID
    jsonwebtoken.verify(slicedToken, jwtKey, (error, decoded) => {
        if (error) {
            userID = undefined;
        } else {
            userID = decoded.userId;
        }
    })

    return userID
}