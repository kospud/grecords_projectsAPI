import express from 'express';
import bodyParser from 'body-parser';
import { routes } from './settings/routes.js';

const app=express();
const port =process.env.PORT || 3500;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

routes(app);

app.listen(port, ()=>{
    console.log(`App listen on port ${port}`);
})