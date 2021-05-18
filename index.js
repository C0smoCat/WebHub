"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");
const config = require("./config.js");
const router = require("./app/index.js");
const cookieParser = require("cookie-parser");
const md5File = require("md5-file");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
let mysqlAdmin;

try {
    mysqlAdmin = require("node-mysql-admin");
} catch (e) {
    console.error(`Модуль mysqlAdmin не подгружен: ${ e }`);
}

console.log(`Debug mode: ${ config.debug_mode }`);

const pgClient = new Client(config.databaseConfig || {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pgClient.rquery = async (sql, params) => {
    try{
        const res = await pgClient.query(sql, params);
        return res.rows;
    }catch (e) {
        console.error(e);
        return [];
    }
};

pgClient.rquery1 = async (sql, params) => {
    const res = await pgClient.rquery(sql, params);
    return res[0];
};

pgClient.connect();

pgClient.rquery("select ($1::int + $2::int * $3::int) as result", [ 2, 2, 2 ])
    .then(result => console.log(`БД работает: 2 + 2 * 2 = ${ result[0].result }`))
    .catch(e => console.error(`БД не работает: ${ e }`));

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
    console.log(`Найдено файлов: ${ files.length }`);
    for (let fi = 0; fi < files.length; fi++) {
        const f = files[fi];
        const file_data = fs.readFileSync(f);
        let file_hash = md5File.sync(f);
        let file_size = fs.statSync(f).size;
        let file_type = mime.lookup(f);
        await pgClient.rquery("INSERT INTO files(id, file_size, file_type, file_data) VALUES ($1,$2,$3,$4) ON conflict DO NOTHING",
            [ file_hash, file_size, file_type, file_data ]);
        fs.renameSync(f, path.join(__dirname, "hashes", `${ file_hash }${ path.extname(f) }`));
        console.log(`Залито: ${ f }\t->\t${ file_hash }\t${ file_size }\t${ file_type }\t${ Math.round(fi / files.length * 100) }%`);
    }
    console.log(`Готово.`);
}

a();

const app = express();

app.set("view engine", "pug");

app.use((req, res, next) => {
    let ip = req.connection.remoteAddress;
    console.log(`weblog Request from ${ ip } [${ req.headers["x-forwarded-for"] }] (${ req.headers.referer }) ${ req.method } ${ req.headers.host } ${ req.originalUrl } ${ req.headers["accept-language"] } ${ req.headers["user-agent"] }`);
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

router(app, pgClient);

if (mysqlAdmin)
    app.use(mysqlAdmin(app));

app.listen(config.port, () => {
    console.log(`Web server live on port ${ config.port }`);
});

function ApplyFeatures() {
    console.cdir = (...objs) =>
        console.dir(...objs, { colors: true });

    Date.prototype.addDays = function (days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    };

    Date.prototype.formatDate = function () {
        let diff = new Date() - this; // разница в миллисекундах

        if (diff < 1000) { // меньше 1 секунды
            return "прямо сейчас";
        }

        let sec = Math.floor(diff / 1000); // преобразовать разницу в секунды

        if (sec < 60) {
            return sec + " сек. назад";
        }

        let min = Math.floor(diff / (60 * 1000)); // преобразовать разницу в минуты
        if (min < 60) {
            return min + " мин. назад";
        }

        let hours = Math.floor(diff / (60 * 60 * 1000)); // преобразовать разницу в минуты
        if (hours < 24) {
            return hours + " час назад";
        }

        // отформатировать дату
        // добавить ведущие нули к единственной цифре дню/месяцу/часам/минутам
        let d = this;
        d = [
            "0" + d.getDate(),
            "0" + (d.getMonth() + 1),
            "" + d.getFullYear(),
            "0" + d.getHours(),
            "0" + d.getMinutes()
        ]
            .map(component => component.slice(-2)); // взять последние 2 цифры из каждой компоненты

        // соединить компоненты в дату
        return d.slice(0, 3).join(".") + " " + d.slice(3).join(":");
    };

    Date.prototype.toDateString = function () {
        let d = this.getDate();
        let m = this.getMonth() + 1;
        return `${ (d > 9 ? "" : "0") }${ d }.${ (m > 9 ? "" : "0") }${ m }.${ this.getFullYear() }`;
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

process.on("SIGINT", (code) => {
    pgClient.end();
    app.close();
    console.log(`About to exit with code: ${ code }`);
});
