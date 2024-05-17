import express from 'express';
import bodyParser from 'body-parser';
import { routes } from './settings/routes.js';
import passport from 'passport';
import { newjwtStrategy } from './middleware/passport.js';
import cors from 'cors'


const app = express();
const port = process.env.PORT || 3500;

//использование парсеров для автоматического извлечения данных из запроса в типы данных языка JS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//использование аутентификации пользователя с помощью Passport.JS с включенной стратегией
app.use(passport.initialize());
newjwtStrategy(passport);

//CORS политика
app.use(cors({
  origin: '*', // Разрешить запросы только с этого домена
}));

//Создание маршрутов ресурсов
routes(app);

//Запуск сервера 
app.listen(port, () => {
  console.log(`App listen on port ${port}`);
})