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
            res.sendFile(path.join(__dirname, "../docs/Макет/исходники/Лого.png"));
            break;
        case "/index/vk.png":
            res.sendFile(path.join(__dirname, "../docs/Макет/исходники/vk.png"));
            break;
        case "/index/tv.png":
            res.sendFile(path.join(__dirname, "../docs/Макет/исходники/tv.png"));
            break;
        case "/index/ok.png":
            res.sendFile(path.join(__dirname, "../docs/Макет/исходники/ok.png"));
            break;

        default:
            await Route_Error(res, 404, "Страница не найдена", "Габе жив");
            break;
    }
}

async function RouteIndex(app, db, req, res) {
    res.render(path.join(__dirname, "index", "index.pug"), {
        basedir: path.join(__dirname, "index")
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