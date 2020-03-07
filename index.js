"use strict";

// const md5File = require('md5-file');
// const fs = require('fs');
// const config = require("./config.js");
// const crypto = require('crypto');
// const mysql = require('mysql2');
// const mime = require('mime-types');
// const path = require("path");
//
// const db = mysql.createPool(config.databaseConfig).promise();
// ApplyFeatures();
// db.rquery = async (sql, params) => {
//     return (await db.query(sql, params))[0];
// };
// let langs = require("./app/langs");
//
// async function a() {
//     for (let lang_id of Object.keys(langs)) {
//         let lang = langs[lang_id];
//         await db.rquery(
//             "INSERT INTO `langs`(id, title, background) VALUES (?, ?, ?)",
//             [lang_id, lang.lang_title, lang.background]);
//
//         for (let theme of lang.themes) {
//             let theme_avatar_path = path.join(__dirname, "app/public", theme.avatar);
//             let theme_avatar_hash = fs.existsSync(theme_avatar_path) ? md5File.sync(theme_avatar_path) : null;
//             let theme_id = (await db.rquery(
//                 "INSERT INTO `lessons_themes`(lang, title, avatar) VALUES (?, ?, ?)",
//                 [lang_id, theme.title, theme_avatar_hash])).insertId;
//
//             for (let lesson of theme.lessons) {
//                 let lesson_avatar_path = path.join(__dirname, "app/public", lesson.avatar);
//                 let lesson_avatar_hash = fs.existsSync(lesson_avatar_path) ? md5File.sync(lesson_avatar_path) : null;
//
//                 let theme_index = lang.themes.findIndex((value) => value.title === theme.title);
//                 let lesson_index = theme.lessons.findIndex((value) => value.title === lesson.title);
//
//                 let lesson_md_path = path.join(__dirname, "app/lesson/lessons", lang_id, (theme_index + 1).toString(), `${lesson_index + 1}.md`);
//                 let lesson_md_content = fs.existsSync(lesson_md_path) ? fs.readFileSync(lesson_md_path) : "Урок ещё не написан";
//
//                 let lesson_id = (await db.rquery(
//                     "INSERT INTO `lessons`(lesson_theme_id, title, avatar, markdown) VALUES (?,?,?,?)",
//                     [theme_id, lesson.title, lesson_avatar_hash, lesson_md_content])).insertId;
//             }
//         }
//     }
// }
//
// a();


// const md5File = require('md5-file');
// const fs = require('fs');
// const path = require("path");
//
// async function a() {
//     let files = [
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava1.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava3.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava5.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava6.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava7.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava8.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava9.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava10.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava11.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava12.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava13.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava14.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava15.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava16.png",
//         "C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava17.png"
//     ];
//     for (let f of files) {
//         let file_hash = md5File.sync(f);
//         fs.renameSync(f, path.join(__dirname, "app", "public", "avatars", `${file_hash}.png`));
//     }
// }
//
// a();


const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer')({dest: `${__dirname}/uploads`});
const config = require("./config.js");
const router = require('./app/index.js');

console.log(`Debug mode: ${config.debug_mode}`);

const dbConnection = mysql.createPool(config.databaseConfig).promise();

dbConnection.rquery = async (sql, params) => {
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