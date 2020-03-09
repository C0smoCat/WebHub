"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const config = require("./config.js");
const router = require('./app/index.js');
const cookieParser = require('cookie-parser');
const md5File = require('md5-file');
const fs = require('fs');
const path = require("path");
const mime = require('mime-types');

console.log(`Debug mode: ${config.debug_mode}`);

const dbConnection = mysql.createPool(config.databaseConfig).promise();

dbConnection.rquery = async (sql, params) => {
    return (await dbConnection.query(sql, params))[0];
};

dbConnection.rquery("select (?+?*?) as result", [2, 2, 2])
    .then(result => console.log(`БД работает: 2 + 2 * 2 = ${result[0].result}`))
    .catch(e => console.error(`БД не работает: ${e}`));

process.on('exit', (code) => {
    dbConnection.close();
    console.log(`About to exit with code: ${code}`);
});

ApplyFeatures();

function getFiles(dir) {
    let result = [];
    let files = fs.readdirSync(dir);
    for (let f of files) {
        let filePath = path.join(dir, f);
        if (fs.statSync(filePath).isDirectory())
            result.push(...getFiles(filePath));
        else
            result.push(filePath);
    }
    return result;
}

async function a() {
    let findPath = path.join(__dirname, "public");
    if (!fs.existsSync(findPath))
        return;
    console.log(`Заливаем файлы из public в бд...`);
    let outDir = path.join(__dirname, "hashes");
    if (!fs.existsSync(outDir))
        fs.mkdirSync(outDir);
    let files = getFiles(findPath);
    console.log(`Найдено файлов: ${files.length}`);
    for (let f of files) {
        let file_hash = md5File.sync(f);
        let file_size = fs.statSync(f).size;
        let file_type = mime.lookup(f);
        await dbConnection.rquery("INSERT INTO files(id, file_size, file_type, file_data) VALUES (?,?,?,LOAD_FILE(?)) ON DUPLICATE KEY UPDATE file_data = LOAD_FILE(?)",
            [file_hash, file_size, file_type, f, f]);
        fs.renameSync(f, path.join(__dirname, "hashes", `${file_hash}.${path.extname(f)}`));
        console.log(`Залито: ${f}\t->\t${file_hash}\t${file_size}\t${file_type}`);
    }
    console.log(`Готово.`);
}

a();

const app = express();

app.set("view engine", "pug");

app.use((req, res, next) => {
    let ip = req.connection.remoteAddress;
    console.log(`weblog Request from ${ip} [${req.headers["x-forwarded-for"]}] (${req.headers.referer}) ${req.method} ${req.headers.host} ${req.originalUrl} ${req.headers["accept-language"]} ${req.headers["user-agent"]}`);
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
    router(app, dbConnection, req, res, next);
    next();
});

app.listen(config.port, () => {
    console.log(`Web server live on port ${config.port}`);
});

function ApplyFeatures() {
    console.cdir = (...objs) =>
        console.dir(...objs, {colors: true});

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