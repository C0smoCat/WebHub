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
    switch (req.originalUrl.toLowerCase()) {
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
        case "/index/logo.png":
            res.sendFile(path.join(__dirname, "./public/logo2.png"));
            break;
        case "/index/logo2.png":
            res.sendFile(path.join(__dirname, "./public/logo.png"));
            break;
        case "/index/vk.png":
            res.sendFile(path.join(__dirname, "./public/vk.png"));
            break;
        case "/index/tv.png":
            res.sendFile(path.join(__dirname, "./public/tv.png"));
            break;
        case "/index/ok.png":
            res.sendFile(path.join(__dirname, "./public/ok.png"));
            break;
        case "/index/slide.jpg":
            res.sendFile(path.join(__dirname, "./public/slider.jpg"));
            break;
        case "/index/gabe":
            res.sendFile(path.join(__dirname, "./public/gabe.png"));
            break;
        default:
            await Route_Error(res, 404, "Страница не найдена", "Габе жив");
            break;
    }
}

async function RouteIndex(app, db, req, res) {
    res.render(path.join(__dirname, "index", "index.pug"), {
        basedir: path.join(__dirname, "index"),
        count_online: 228,
        count_users: 1337,
        count_lessons: 10101,
        user_avatar: "data:image/png;base64,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"
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