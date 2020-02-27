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
        comment1: {
            login: "Васян Пупкин",
            text: "Прошёл 228 курсов мне защло топ сайт",
            status: "кондитер",
            avatar: "/avatars/ava13.jpeg"
        },
        comment2: {
            login: "Газиз",
            text: "Мне приснился кошмар где я кодил 5 дней подряд, а на 7 сделал Вовин сапёр.",
            status: "знаток mail.ru",
            avatar: "/avatars/ava14.jpg"
        },
        comment3: {
            login: "Azino777",
            text: "Сайт *****, курсы дешёвые. Можно заработать гораздо больше, всего лишь...",
            status: "online кино",
            avatar: "/avatars/ava15.jpg"
        },
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        },
        slider_items: [
            {
                img: Math.randomizeArray(["logoJS.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logoJS.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logoJS.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logoJS.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logoJS.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logoJS.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            },
            {
                img: Math.randomizeArray(["logoJS.png", "udishka.png", "slider.jpg"]),
                text: Math.randomizeArray(["Габе1", "Габе2", "Габе3", "Габе4"])
            }
        ]
    });
}

async function Route_Courses(app, db, req, res) {
    res.render(path.join(__dirname, "courses", "index.pug"), {
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
                        progress: 0,
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
        basedir: path.join(__dirname, "error404")
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