import express from 'express';
import morgan from 'morgan';
import StudentRoute from './routes/StudentRoute';
import students from './data/students.json';
import _ from 'lodash';
import bodyParser from 'body-parser';
import path from 'path';
import https from 'https';
import fs from 'fs';

const tlsOptions = {
    key: fs.readFileSync(path.join('key.pem')),
    cert: fs.readFileSync(path.join('cert.pem')),
    passphrase: 'hello'
};

const PORT = 3000;
const TLS_PORT = 3003;

const buildUrl = (version, path) => `/api/${version}/${path}`;
const STUDENTS_BASE_URL = buildUrl('v1', 'students');

const server = express();

server.use(morgan('tiny'));
server.use(bodyParser.json());
server.use('/static', express.static('public'));

server.set('views', path.join('views'));
server.set('view engine', 'ejs');

server.use(STUDENTS_BASE_URL, StudentRoute);

server.get('/', (req, res) => {
    res.render('index', {
        students
    });
});

server.get('/download/images/:imageName', (req, res) => {
    res.download(path.join('public', 'images', req.params.imageName));
});

server.get('/route-handlers', (req, res, next) => {
    // beginning of route handler
    // ...
    // ... everything before response is sent to client is a middleware
    //
    res.send("learning route handlers is cool");
    next();
}, (req, res, next) => {
    console.log("sencond handler");
    next();
}, (req, res) => {
    console.log("third handler");
});

server.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});

https.createServer(tlsOptions, server).listen(TLS_PORT, () => {
    console.log(`HTTPS server started on port ${TLS_PORT}`);
});
