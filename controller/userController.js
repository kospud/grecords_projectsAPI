import jsonwebtoken from "jsonwebtoken";
import { responseStatus } from "../response.js";
import { connection } from "../settings/db.js";
import bcryptjs from "bcryptjs";
import { jwtKey } from "../settings/jwtKey.js";
import { getUserID } from "../commonModule.js";

export const getAllUsers = (req, res) => {
    connection.query('SELECT `userID`,`userName`, `userSurname`, `userEmail` FROM `users`', (error, rows, fields) => {
        if (error)
            responseStatus(200, error, res);
        else {
            responseStatus(200, rows, res);
        }
    })
}

export const getUser=(req, res)=>{
    
    const sql='SELECT `userID`,`userName`, `userSurname`, `userEmail` FROM `users` WHERE userID=?'
    const userId=getUserID(req.headers['authorization']);

    connection.query(sql, userId, (error, rows, fields)=>{
        if(error){
            responseStatus(500, error, res)
        } else{
            responseStatus(200,rows,res)
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

            const salt = bcryptjs.genSaltSync(15);

            const userArrayKeys = ['userName', 'userSurname', 'email', 'password'];

            const user = userArrayKeys.map((key, index) => {
                return index === 3 ? bcryptjs.hashSync(req.body[key], salt) : req.body[key]
            })


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

export const signin = (req, res) => {

    let sql = "SELECT `userID`, `userEmail`, `userPassword`,`userName`, `userSurname` FROM `users` WHERE `userEmail`= ?";

    connection.query(sql, req.body.email, (error, rows, fields) => {
        if (error)
            responseStatus(500, {message: error.message}, res)
        if (typeof rows == 'undefined' || rows.length <= 0) {
            responseStatus(401, { message: `Пользователя с таким e-mail - ${req.body.email} не существует` }, res)
        } else {
            const rowsParsed = JSON.parse(JSON.stringify(rows))

            rowsParsed.map(row => {

                const passwordChekResult = bcryptjs.compareSync(req.body.password, row.userPassword)

                if (passwordChekResult) {

                    const token = jsonwebtoken.sign(
                        { userId: row.userID, userEmail: row.UserEmail },
                        jwtKey,
                        { expiresIn: "15d" })

                    responseStatus(200, { token: `Bearer ${token}`, id: row.userId, email: row.userEmail, userName: `${row.userName} ${row.userSurname}` }, res);
                } else {
                    responseStatus(401, { message: 'Неверный пароль' }, res);
                }
                return true
            })
        }
    })
}

