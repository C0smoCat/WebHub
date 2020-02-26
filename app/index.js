const path = require("path");
const config = require("../config.js");
const pug = require('pug');

module.exports = async function (app, db, req, res, next) {
    let logTimeLabel = `timelog Обработка запроса ${req.originalUrl} от ${req.connection.remoteAddress}`;
    console.time(logTimeLabel);
    try {
        await Route(app, db, req, res, next);
    } catch (e) {
        await Route_Error(res, 500, "Ошибка сервера", e);
        console.error(e);
    }
    console.timeEnd(logTimeLabel);
};

async function Route(app, db, req, res) {
    let url = req.originalUrl.toLowerCase();
    if (url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg"))
        res.sendFile(path.join(__dirname, "public", url));
    else
        switch (url) {
            case "/go/phpmyadmin":
            case "/adm/phpmyadmin":
            case "/adm":
            case "/adminer":
            case "/go/adminer":
            case "/phpmyadmin":
                await RouteAdminer(app, db, req, res);
                break;
            case "/":
                await RouteIndex(app, db, req, res);
                break;
            default:
                await Route_Error(res, 404, "Страница не найдена", "Габе жив");
                break;
        }
}

async function RouteIndex(app, db, req, res) {
    res.render(path.join(__dirname, "index", "index.pug"), {
        basedir: path.join(__dirname, "index"),
        count_online: Math.randomInt(1000, 10000),
        count_users: Math.randomInt(10000, 100000),
        count_lessons: Math.randomInt(1000, 10000),
        user_avatar: `/avatars/ava${Math.randomInt(1, 13)}.png`
    });
}

async function RouteAdminer(app, db, req, res) {
    res.redirect(301, 'https://youtu.be/dQw4w9WgXcQ');
}

async function Route_Error(res, error_code, error_msg, error_desc = "Попробуйте перейти на главную") {
    res.render(path.join(__dirname, "error404", "index.pug"), {
        error_code,
        error_msg,
        error_desc,
        basedir: path.join(__dirname, "error404")
    });
}