import express from 'express';
import bodyParser from 'body-parser';
import { routes } from './settings/routes.js';
import passport from 'passport';
import { newjwtStrategy } from './middleware/passport.js';
import cors from 'cors'


const app=express();
const port =process.env.PORT || 3500;

  
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(passport.initialize());
newjwtStrategy(passport);

app.use(cors({
    origin: '*', // Разрешить запросы только с этого домена
  }));

routes(app);

app.listen(port, ()=>{
    console.log(`App listen on port ${port}`);
})