import { responseStatus } from "../response.js";
import { connection } from "../settings/db.js";
import pkg from "bcryptjs"


export const getAllUsers = (req, res) => {
    connection.query('SELECT `userID`,`userName`, `userSurname`, `userEmail` FROM `users`', (error, rows, fields) => {
        if (error)
            responseStatus(400, error, res);
        else {
            responseStatus(200, rows, res);
        }
    })
}

export const signup = (req, res) => {

    let sql = "SELECT `userID`, `userName`, `userEmail` FROM `users` WHERE `userEmail`=?";

    connection.query(sql, req.body.email, (error, rows, fields) => {
        if (error) {
            responseStatus(400, error, res);
        } else if (typeof rows !== 'undefined' && rows.length > 0) {

            const rowsParsed = JSON.parse(JSON.stringify(rows))

            rowsParsed.map(row => {
                responseStatus(302, { message: `Пользователь с таким e-mail - ${row.userEmail} уже зарегистрирован` }, res)
            })
        }
        else {

            const salt = pkg.genSaltSync(15);

            const userArrayKeys = ['userName', 'userSurname', 'email', 'password'];

            const user = userArrayKeys.map((key, index) => {
                return index === 3 ? pkg.hashSync(req.body[key], salt) : req.body[key]
            })

            console.log(user)
            sql = 'INSERT INTO `users` (`userName`, `userSurname`, `userEmail`,`userPassword`) VALUES(?,?,?,?)'

            connection.query(sql, user, (error, results) => {
                if (error)
                    console.log(error)
                else
                    responseStatus(200, results, res);
            })
        }

    })

}