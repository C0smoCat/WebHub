"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer')({dest: `${__dirname}/uploads`});
const config = require("./config.js");
const router = require('./app/index.js');

console.log(`Debug mode: ${config.debug_mode}`);

console["cdir"] = (...objs) => console.dir(...objs, {colors: true});

const dbConnection = mysql.createPool(config.databaseConfig).promise();

dbConnection["rquery"] = async (sql, params) => {
    return (await dbConnection.query(sql, params))[0];
};

// connection.config.queryFormat = function (query, values) {
//     if (!values) return query;
//     return query.replace(/\:(\w+)/g, function (txt, key) {
//         if (values.hasOwnProperty(key)) {
//             return this.escape(values[key]);
//         }
//         return txt;
//     }.bind(this));
// };

ApplyFeatures();

const app = express();

app.set("view engine", "pug");

app.use((req, res, next) => {
    let ip = req.connection.remoteAddress;
    console.log(`weblog Request from ${ip} [${req.headers["x-forwarded-for"]}] (${req.headers.referer}) ${req.method} ${req.headers.host} ${req.originalUrl} ${req.headers["accept-language"]} ${req.headers["user-agent"]}`);
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// let router_api = express.Router();
// router_api.all('*', multer.single('file'), async function (req, res) {
//     await route_api(app, dbConnection, req, res);
// });
app.use((req, res, next) => {
    router(app, dbConnection, req, res, next);
    next();
});

app.listen(config.port, () => {
    console.log(`Web server live on ${config.port}`);
});

//dbConnection.end();

function ApplyFeatures() {
    Date.prototype.addDays = function (days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    };

    Date.prototype.toDateString = function () {
        let d = this.getDate();
        let m = this.getMonth() + 1;
        return `${(d > 9 ? '' : '0')}${d}.${(m > 9 ? '' : '0')}${m}.${this.getFullYear()}`;
    };

    Date.prototype.isValid = function () {
        return !isNaN(this);
    };

    Math.randomizeArray = (array) =>
        array[Math.floor(Math.random() * (array.length))];

    Math.randomInt = (min, max) =>
        Math.floor(min + Math.random() * (max - min));

    Math.randomFloat = (min, max) =>
        min + Math.random() * (max - min);

    Math.lerp = (t, a, b) =>
        a + (b - a) * t;

    Math.unLerp = (t, a, b) =>
        (t - a) / (b - a);

    Math.clamp = (t, a = 0, b = 1) =>
        t < a ? a : t > b ? b : t;

    Math.roundN = (a, n = 2) =>
        Math.round(a * (10 ** n)) / (10 ** n);

    Array.dedublicate = function () {
        return this.filter((a, b) => this.indexOf(a) === b);
    };
}