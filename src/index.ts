"use strict"
/**
 * @author Pramit Mangukiya
 * @description Server and REST API config  
 */
import * as bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors'
import { mongooseConnection } from './database'
import http from 'http';
import * as packageInfo from '../package.json'
import path from "path"
import router from './routes';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './swagger/swagger.json';
import { config } from '../config';

const app = express();

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(cors())
app.use(mongooseConnection)
app.use(bodyParser.json({ limit: '200mb' }))
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }))


app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

const health = (req, res) => {
  return res.status(200).json({
    message: `Bharat Exam Fest BE Server is Running, Server health is green`,
    app: packageInfo.name,
    version: packageInfo.version,
    description: packageInfo.description,
    author: packageInfo.author,
    license: packageInfo.license
  })
}

const bad_gateway = (req, res) => { return res.status(502).json({ status: 502, message: "Bharat Exam Fest Backend API Bad Gateway" }) }


app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req, res) => {
  res.send('Server is running ');
});

var options = {}
let swaggerDocument1:any = swaggerDocument
app.use('/api-docs', function(req:any, res, next) {
    swaggerDocument1.host = config.BACKEND_URL;
    req.swaggerDoc = swaggerDocument1;
    next();
}, swaggerUi.serveFiles(swaggerDocument1, options), swaggerUi.setup());

app.use(router)
app.use('*', bad_gateway);

export let server = new http.Server(app);