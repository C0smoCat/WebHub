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
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`
        },
        comment2: {
            login: "Газиз",
            text: "Мне приснился кошмар где я кодил 5 дней подряд, а на 7 сделал Вовин сапёр.",
            status: "знаток mail.ru",
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`
        },
        comment3: {
            login: "Azino777",
            text: `Error: ENOENT: no such file or directory, stat 'C:\\OSPanel\\domains\\rp-31\\WebHub\\app\\public\\avatars\\ava14.png'
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /lock.png ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /lock.png от ::1: 0.136ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /gabe.png ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /gabe.png от ::1: 0.524ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /udishka.png ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /udishka.png от ::1: 0.220ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /slider.jpg ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /slider.jpg от ::1: 0.327ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /logoJS.png ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /logoJS.png от ::1: 0.441ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /avatars/ava13.jpeg ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /avatars/ava13.jpeg от ::1: 0.189ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /avatars/ava14.jpg ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /avatars/ava14.jpg от ::1: 0.115ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /avatars/ava15.jpg ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /avatars/ava15.jpg от ::1: 0.287ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /logo2.png ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /logo2.png от ::1: 0.155ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /vk.png ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /vk.png от ::1: 0.078ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /tv.png ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /tv.png от ::1: 0.094ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /ok.png ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /ok.png от ::1: 0.118ms
weblog Request from ::1(http://localhost:8080/) GET localhost:8080 /favicon.ico ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7 Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
timelog Обработка запроса /favicon.ico от ::1: 161.917ms`,
            status: "online кино",
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`
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
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        },
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