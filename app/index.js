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
            case "/courses":
            case "/courses/":
                await Route_Courses(app, db, req, res);
                break;
            case "/forum":
            case "/forum/":
                await Route_Forum(app, db, req, res);
                break;
            case "/leaderboard":
            case "/leaderboard/":
                await Route_Leaderboard(app, db, req, res);
                break;
            case "/play":
            case "/play/":
                await Route_Play(app, db, req, res);
                break;
            case "/sandbox":
            case "/sandbox/":
                await Route_Sandbox(app, db, req, res);
                break;
            case "/login":
            case "/login/":
                await Route_Login(app, db, req, res);
                break;
            case "/user":
            case "/user/":
                await Route_User(app, db, req, res);
                break;
            case "/about":
            case "/about/":
                await Route_About(app, db, req, res);
                break;
            case "/favicon.ico":
                res.sendFile(path.join(__dirname, "public", "avatars", "ava7.png"));
                break;
            default:
                await Route_Error(res, 404, "Страница не найдена", "");
                break;
        }
}

async function RouteIndex(app, db, req, res) {
    let comments = [{
        login: "Васян Пупкин",
        text: "Прошёл 228 курсов мне защло топ сайт",
        status: "кондитер",
        avatar: `/avatars/ava13.png`
    }, {
        login: "Газиз",
        text: "Мне приснился кошмар где я кодил 5 дней подряд, а на 7 сделал Вовин сапёр.",
        status: "знаток mail.ru",
        avatar: `/avatars/ava14.png`
    }, {
        login: "Azino777",
        text: "Сайт *****, курсы дешёвые. Можно заработать гораздо больше, всего лишь...",
        status: "online кино",
        avatar: `/avatars/ava15.png`
    }, {
        login: "Данил",
        text: "Разработчики, добавьте побольше доната и рекламы. И Вова, не ломай сайт.",
        status: "¯\\_(ツ)_/¯",
        avatar: `/avatars/ava16.png`
    }, {
        login: "Габе",
        text: "Борк-борк!",
        status: "живой",
        avatar: `/avatars/ava5.png`
    }, {
        login: "Среднекоммент",
        text: "Википе́дия — общедоступная многоязычная универсальная интернет-энциклопедия со свободным контентом, реализованная на принципах вики. Расположена по адресу www.wikipedia.org. Владелец сайта — американская некоммерческая организация «Фонд Викимедиа», имеющая 37 региональных представительств",
        status: "тест-тест",
        avatar: `/avatars/ava4.png`
    }, {
        login: "Длиннокоммент",
        text: "В отличие от традиционных энциклопедий, таких, как Encyclopædia Britannica, ни одна статья в Википедии не проходит формального процесса экспертной оценки. Любая статья Википедии может редактироваться как с учётной записи участника, так даже и без регистрации на проекте (за исключением некоторых страниц, подверженных частому вандализму, которые доступны для изменения только определённым категориям участников или, в крайних случаях, только администраторам Википедии), и при этом все внесённые в статью изменения незамедлительно становятся доступными для просмотра любыми пользователями. Поэтому Википедия «не гарантирует истинность» своего содержимого, ведь в любом случае между моментом, когда в статью будет внесена какая-то недостоверная информация, и моментом, когда эта информация будет удалена из статьи другим участником Википедии (более компетентным в данной области знания), пройдёт определённое время. (Естественно, для того, чтобы обнаружить и удалить из статьи явный вандализм, нужно намного меньше времени, чем для того, чтобы освободить статью от недостоверной информации, когда подобная недостоверность не является особо очевидной.) Содержимое Википедии подпадает под действие законов (в частности, авторского права) штата Флорида в США, где находятся серверы Википедии, и нескольких редакционных политик и руководств, которые призваны укрепить идею о том, что Википедия является энциклопедией.",
        status: "тест-тест",
        avatar: `/avatars/ava12.png`
    }];
    res.render(path.join(__dirname, "index", "index.pug"), {
        basedir: path.join(__dirname, "index"),
        current_page: "index",
        is_big_topnav: true,
        count_online: Math.randomInt(1000, 10000),
        count_users: Math.randomInt(10000, 100000),
        count_lessons: Math.randomInt(1000, 10000),
        comment1: Math.randomizeArray(comments),
        comment2: Math.randomizeArray(comments),
        comment3: Math.randomizeArray(comments),
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        },
        slider_items: [
            {
                img: Math.randomizeArray(["logo-js.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logo-js.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logo-js.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logo-js.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logo-js.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logo-js.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logo-js.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            }
        ]
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Courses(app, db, req, res) {
    res.render(path.join(__dirname, "courses", "index.pug"), {
        basedir: path.join(__dirname, "courses"),
        current_page: "courses",
        themes: [
            {
                title: "Основы",
                avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                progress: 1,
                is_complete: true,
                is_lock: false,
                is_exam_complete: true,
                lessons: [
                    {
                        title: "Что такое C#",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 1,
                        is_complete: true
                    },
                    {
                        title: "Переменные",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 1,
                        is_complete: true
                    },
                    {
                        title: "Hello World!",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 1,
                        is_complete: true
                    },
                    {
                        title: "Вывод текста",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 1,
                        is_complete: true
                    }
                ]
            },
            {
                title: "Основы 2",
                avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                progress: 0.5,
                is_complete: false,
                is_lock: false,
                is_exam_complete: false,
                lessons: [
                    {
                        title: "Что такое C#",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 1,
                        is_complete: true
                    },
                    {
                        title: "Переменные",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 1,
                        is_complete: true
                    },
                    {
                        title: "Hello World!",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 0,
                        is_complete: false
                    },
                    {
                        title: "Вывод текста",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 0.5,
                        is_complete: false
                    },
                    {
                        title: "Переменные2",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 1,
                        is_complete: true
                    },
                    {
                        title: "Hello World!2",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 0,
                        is_complete: false
                    },
                    {
                        title: "Вывод текста2",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 0,
                        is_complete: false
                    }
                ]
            },
            {
                title: "Основы 3",
                avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                progress: 0,
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                lessons: [
                    {
                        title: "Что такое C#",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 0,
                        is_complete: false
                    },
                    {
                        title: "Переменные",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 0,
                        is_complete: false
                    },
                    {
                        title: "Hello World!",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 0,
                        is_complete: false
                    },
                    {
                        title: "Вывод текста",
                        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                        progress: 0,
                        is_complete: false
                    }
                ]
            }
        ],
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        }
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Forum(app, db, req, res) {
    res.render(path.join(__dirname, "forum", "index.pug"), {
        basedir: path.join(__dirname, "forum"),
        current_page: "forum",
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        }
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Leaderboard(app, db, req, res) {
    res.render(path.join(__dirname, "leaderboard", "index.pug"), {
        basedir: path.join(__dirname, "leaderboard"),
        current_page: "leaderboard",
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        }
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Play(app, db, req, res) {
    res.render(path.join(__dirname, "play", "index.pug"), {
        basedir: path.join(__dirname, "play"),
        current_page: "play",
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        }
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Sandbox(app, db, req, res) {
    res.render(path.join(__dirname, "sandbox", "index.pug"), {
        basedir: path.join(__dirname, "sandbox"),
        current_page: "sandbox",
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        }
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Login(app, db, req, res) {
    res.render(path.join(__dirname, "login", "index.pug"), {
        basedir: path.join(__dirname, "login"),
        current_page: "login",
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        }
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_User(app, db, req, res) {
    res.render(path.join(__dirname, "user", "index.pug"), {
        basedir: path.join(__dirname, "user"),
        current_page: "user",
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        }
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_About(app, db, req, res) {
    res.render(path.join(__dirname, "about", "index.pug"), {
        basedir: path.join(__dirname, "about"),
        current_page: "about",
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        }
    }, (err, page) => HandleResult(err, page, res));
}

async function RouteAdminer(app, db, req, res) {
    res.redirect(301, 'https://youtu.be/dQw4w9WgXcQ');
}

async function Route_Error(res, error_code, error_msg, error_desc = "") {
    res.render(path.join(__dirname, "error404", "index.pug"), {
        basedir: path.join(__dirname, "error404"),
        current_page: "error404",
        error_code,
        error_msg,
        error_desc
    }, (err, page) => HandleResult(err, page, res));
}

async function HandleResult(err, page, res) {
    if (err)
        await Route_Error(res, err.code, "Ну чё, сломал?", err.message);
    else
        res.end(page);
}