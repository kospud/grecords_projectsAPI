import { createConnection } from "mysql";
import { dataBaseConfig } from "../dbenv.js";

export const connection=createConnection(dataBaseConfig)

connection.connect((error)=>{
    if(error)
        return console.log('Ошибка подключения к базе данных')
    else
        return console.log('Подключение к базе данных успешно')

})