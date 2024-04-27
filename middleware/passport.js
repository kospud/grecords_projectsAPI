import { Strategy, ExtractJwt } from 'passport-jwt';
import { jwtKey } from '../settings/jwtKey.js';
import { connection } from '../settings/db.js';

const jwtStrategy = Strategy;
const extractJwt = ExtractJwt;

//параметры для стратегии
const options = {
    jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),//JWT токен берется из заголовка запроса
    secretOrKey: jwtKey//мой ключ
}

export const newjwtStrategy = (passport) => {
    passport.use(
        new jwtStrategy(options, (payload, done) => {
            try {
                connection.query('SELECT `userId`, `userEmail` FROM `users` WHERE `userId`=?', payload.userId, (error, rows, fields) => {
                    if (error) {
                        console.log(error)
                    } else {

                        const user = rows
                        
                        if (user) {
                            done(null, user)
                        } else {
                            done(null, false)
                        }
                    }
                })
            } catch (e) {
                console.log(e);
            }
        })
    )
}