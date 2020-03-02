const path = require("path");
const config = require("../config.js");
const pug = require('pug');
const fs = require('fs');

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
    let url = /^\/(?<q>[^?^&]*)[?&]?/.exec(req.originalUrl.toLowerCase()).groups.q;
    if (url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg")) {
        let fpath = path.join(__dirname, "public", url);
        if (fs.existsSync(fpath))
            res.sendFile(fpath);
        else
            res.sendFile(path.join(__dirname, "public", "no-img.png"));
    } else
        switch (url) {
            case "go/phpmyadmin":
            case "adm/phpmyadmin":
            case "adm":
            case "adminer":
            case "go/adminer":
            case "phpmyadmin":
                await RouteAdminer(app, db, req, res);
                break;
            case "":
                await RouteIndex(app, db, req, res);
                break;
            case "courses":
            case "courses/":
                await Route_Courses(app, db, req, res);
                break;
            case "forum":
            case "forum/":
                await Route_Forum(app, db, req, res);
                break;
            case "leaderboard":
            case "leaderboard/":
                await Route_Leaderboard(app, db, req, res);
                break;
            case "play":
            case "play/":
                await Route_Play(app, db, req, res);
                break;
            case "sandbox":
            case "sandbox/":
                await Route_Sandbox(app, db, req, res);
                break;
            case "login":
            case "login/":
                await Route_Login(app, db, req, res);
                break;
            case "user":
            case "user/":
                await Route_User(app, db, req, res);
                break;
            case "about":
            case "about/":
                await Route_About(app, db, req, res);
                break;
            case "favicon.ico":
                res.sendFile(path.join(__dirname, "public", "avatars", "ava7.png"));
                break;
            default:
                await Route_Error(res, 404, "Страница не найдена", "");
                break;
        }
}

let langs = {
    cs: {
        themes: [
            {
                title: "Введение в C#",
                avatar: `/logo-cs.png`,
                progress: 1,
                is_complete: true,
                is_lock: false,
                is_exam_complete: true,
                exam_url: "courses/cs/course1/exam",
                lessons: [{
                    title: "Язык C# и платформа .NET",
                    avatar: `/course_ico/cs/1/1.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/cs/course1/lesson2"
                }, {
                    title: "Начало работы с Visual Studio. Первая программа",
                    avatar: `/course_ico/cs/1/2.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/cs/course1/lesson3"
                }, {
                    title: "Компиляция в командной строке с .NET Core CLI",
                    avatar: `/course_ico/cs/1/3.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/cs/course1/lesson4"
                }, {
                    title: "Установка версии языка",
                    avatar: `/course_ico/cs/1/4.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/cs/course1/lesson5"
                }
                ]
            }, {
                title: "Основы программирования на C#",
                avatar: `/logo-cs.png`,
                progress: 0.5,
                is_complete: false,
                is_lock: false,
                is_exam_complete: false,
                exam_url: "courses/cs/course2/exam",
                lessons: [{
                    title: "Структура программы",
                    avatar: `/course_ico/cs/2/1.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/cs/course2/lesson1"
                }, {
                    title: "Переменные",
                    avatar: `/course_ico/cs/2/2.png`,
                    progress: 0.5,
                    is_complete: false,
                    url: "/courses/cs/course2/lesson2"
                }, {
                    title: "Литералы",
                    avatar: `/course_ico/cs/2/3.png`,
                    progress: 0,
                    is_complete: false,
                    url: "/courses/cs/course2/lesson3"
                }, {
                    title: "Типы данных",
                    avatar: `/course_ico/cs/2/4.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson4"
                }, {
                    title: "Консольный ввод-вывод",
                    avatar: `/course_ico/cs/2/5.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson5"
                }, {
                    title: "Арифметические операции",
                    avatar: `/course_ico/cs/2/6.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson6"
                }, {
                    title: "Поразрядные операции",
                    avatar: `/course_ico/cs/2/7.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson7"
                }, {
                    title: "Операции присваивания",
                    avatar: `/course_ico/cs/2/8.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson8"
                }, {
                    title: "Преобразования базовых типов данных",
                    avatar: `/course_ico/cs/2/9.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson9"
                }, {
                    title: "Условные выражения",
                    avatar: `/course_ico/cs/2/10.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson10"
                }, {
                    title: "Условные конструкции",
                    avatar: `/course_ico/cs/2/11.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson11"
                }, {
                    title: "Циклы",
                    avatar: `/course_ico/cs/2/12.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson12"
                }, {
                    title: "Массивы",
                    avatar: `/course_ico/cs/2/13.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson13"
                }, {
                    title: "Программа сортировки массива",
                    avatar: `/course_ico/cs/2/14.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson14"
                }, {
                    title: "Методы",
                    avatar: `/course_ico/cs/2/15.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson15"
                }, {
                    title: "Параметры методов",
                    avatar: `/course_ico/cs/2/16.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson16"
                }, {
                    title: "Передача параметров по ссылке и значению. Выходные параметры",
                    avatar: `/course_ico/cs/2/17.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson17"
                }, {
                    title: "Массив параметров и ключевое слово params",
                    avatar: `/course_ico/cs/2/18.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson18"
                }, {
                    title: "Область видимости (контекст) переменных",
                    avatar: `/course_ico/cs/2/19.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson19"
                }, {
                    title: "Рекурсивные функции",
                    avatar: `/course_ico/cs/2/20.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson20"
                }, {
                    title: "Перечисления enum",
                    avatar: `/course_ico/cs/2/21.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson21"
                }, {
                    title: "Кортежи",
                    avatar: `/course_ico/cs/2/22.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course2/lesson22"
                }
                ]
            }, {
                title: "Классы. Объектно-ориентированное программирование",
                avatar: `/logo-cs.png`,
                progress: 0,
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course3/exam",
                lessons: [{
                    title: "Классы и объекты",
                    avatar: `/course_ico/cs/3/1.png`,
                    progress: 0,
                    is_complete: false,
                    url: "/courses/cs/course3/lesson1"
                }, {
                    title: "Структуры",
                    avatar: `/course_ico/cs/3/2.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson2"
                }, {
                    title: "Типы значений и ссылочные типы",
                    avatar: `/course_ico/cs/3/3.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson3"
                }, {
                    title: "Пространства имен, псевдонимы и статический импорт",
                    avatar: `/course_ico/cs/3/4.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson4"
                }, {
                    title: "Создание библиотеки классов",
                    avatar: `/course_ico/cs/3/5.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson5"
                }, {
                    title: "Модификаторы доступа",
                    avatar: `/course_ico/cs/3/6.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson6"
                }, {
                    title: "Свойства",
                    avatar: `/course_ico/cs/3/7.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson7"
                }, {
                    title: "Перегрузка методов",
                    avatar: `/course_ico/cs/3/8.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson8"
                }, {
                    title: "Статические члены и модификатор static",
                    avatar: `/course_ico/cs/3/9.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson9"
                }, {
                    title: "Константы, поля и структуры для чтения",
                    avatar: `/course_ico/cs/3/10.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson10"
                }, {
                    title: "Перегрузка операторов",
                    avatar: `/course_ico/cs/3/11.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson11"
                }, {
                    title: "Значение null",
                    avatar: `/course_ico/cs/3/12.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson12"
                }, {
                    title: "Индексаторы",
                    avatar: `/course_ico/cs/3/13.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson13"
                }, {
                    title: "Наследование",
                    avatar: `/course_ico/cs/3/14.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson14"
                }, {
                    title: "Преобразование типов",
                    avatar: `/course_ico/cs/3/15.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson15"
                }, {
                    title: "Перегрузка операций преобразования типов",
                    avatar: `/course_ico/cs/3/16.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson16"
                }, {
                    title: "Виртуальные методы и свойства",
                    avatar: `/course_ico/cs/3/17.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson17"
                }, {
                    title: "Сокрытие методов",
                    avatar: `/course_ico/cs/3/18.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson18"
                }, {
                    title: "Различие переопределения и сокрытия методов",
                    avatar: `/course_ico/cs/3/19.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson19"
                }, {
                    title: "Абстрактные классы",
                    avatar: `/course_ico/cs/3/20.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson20"
                }, {
                    title: "Класс System.Object и его методы",
                    avatar: `/course_ico/cs/3/21.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson21"
                }, {
                    title: "Обобщенные типы",
                    avatar: `/course_ico/cs/3/22.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson22"
                }, {
                    title: "Ограничения обобщений",
                    avatar: `/course_ico/cs/3/23.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson23"
                }, {
                    title: "Наследование обобщенных типов",
                    avatar: `/course_ico/cs/3/24.png`,
                    progress: Math.random(),
                    is_complete: false,
                    url: "/courses/cs/course3/lesson24"
                }]
            }, {
                title: "Обработка исключений",
                avatar: `/logo-cs.png`,
                progress: 1,
                is_complete: true,
                is_lock: false,
                is_exam_complete: false,
                exam_url: "courses/cs/course4/exam",
                lessons: [
                    {
                        title: "Конструкция try..catch..finally",
                        avatar: `/course_ico/cs/4/1.png`,
                        progress: 1,
                        is_complete: true,
                        url: "/courses/cs/course4/lesson1"
                    }, {
                        title: "Блок catch и фильтры исключений",
                        avatar: `/course_ico/cs/4/2.png`,
                        progress: 1,
                        is_complete: true,
                        url: "/courses/cs/course4/lesson2"
                    }, {
                        title: "Типы исключений. Класс Exception",
                        avatar: `/course_ico/cs/4/3.png`,
                        progress: 1,
                        is_complete: true,
                        url: "/courses/cs/course1/lesson3"
                    }, {
                        title: "Создание классов исключений",
                        avatar: `/course_ico/cs/4/4.png`,
                        progress: 1,
                        is_complete: true,
                        url: "/courses/cs/course4/lesson4"
                    }, {
                        title: "Поиск блока catch при обработке исключений",
                        avatar: `/course_ico/cs/4/5.png`,
                        progress: 1,
                        is_complete: true,
                        url: "/courses/cs/course4/lesson5"
                    }, {
                        title: "Генерация исключения и оператор throw",
                        avatar: `/course_ico/cs/4/6.png`,
                        progress: 1,
                        is_complete: true,
                        url: "/courses/cs/course4/lesson6"
                    }
                ]
            }, {
                title: "Делегаты, события и лямбды",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: false,
                is_exam_complete: false,
                exam_url: "courses/cs/course5/exam",
                lessons: [
                    {
                        title: "Делегаты",
                        avatar: `/course_ico/cs/5/1.png`,
                        progress: Math.random(),
                        is_complete: false,
                        url: "/courses/cs/course5/lesson1"
                    }, {
                        title: "Применение делегатов",
                        avatar: `/course_ico/cs/5/2.png`,
                        progress: Math.random(),
                        is_complete: false,
                        url: "/courses/cs/course5/lesson2"
                    }, {
                        title: "Анонимные методы",
                        avatar: `/course_ico/cs/5/3.png`,
                        progress: Math.random(),
                        is_complete: false,
                        url: "/courses/cs/course5/lesson3"
                    }, {
                        title: "Лямбды",
                        avatar: `/course_ico/cs/5/4.png`,
                        progress: Math.random(),
                        is_complete: false,
                        url: "/courses/cs/course5/lesson4"
                    }, {
                        title: "События",
                        avatar: `/course_ico/cs/5/5.png`,
                        progress: Math.random(),
                        is_complete: false,
                        url: "/courses/cs/course5/lesson5"
                    }, {
                        title: "Ковариантность и контравариантность делегатов",
                        avatar: `/course_ico/cs/5/6.png`,
                        progress: Math.random(),
                        is_complete: false,
                        url: "/courses/cs/course5/lesson6"
                    }, {
                        title: "Делегаты Action, Predicate и Func",
                        avatar: `/course_ico/cs/5/7.png`,
                        progress: Math.random(),
                        is_complete: false,
                        url: "/courses/cs/course5/lesson7"
                    }
                ]
            }, {
                title: "Интерфейсы",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course6/exam",
                lessons: []
            }, {
                title: "Дополнительные возможности ООП в C#",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course7/exam",
                lessons: []
            }, {
                title: "Объектно-ориентированное программирование. Практика",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course8/exam",
                lessons: []
            }, {
                title: "Коллекции",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course9/exam",
                lessons: []
            }, {
                title: "Работа со строками",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course10/exam",
                lessons: []
            }, {
                title: "Работа с датами и временем",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course11/exam",
                lessons: []
            }, {
                title: "Дополнительные классы и структуры .NET",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course12/exam",
                lessons: []
            }, {
                title: "Многопоточность",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course13/exam",
                lessons: []
            }, {
                title: "Параллельное программирование и библиотека TPL",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course14/exam",
                lessons: []
            }, {
                title: "Aсинхронное программирование. Task-based Asynchronous Pattern",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course15/exam",
                lessons: []
            }, {
                title: "LINQ",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course16/exam",
                lessons: []
            }, {
                title: "Parallel LINQ",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course17/exam",
                lessons: []
            }, {
                title: "Рефлексия",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course18/exam",
                lessons: []
            }, {
                title: "Сборка мусора, управление памятью и указатели",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course19/exam",
                lessons: []
            }, {
                title: "Работа с потоками и файловой системой",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course20/exam",
                lessons: []
            }, {
                title: "Работа с JSON",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course21/exam",
                lessons: [
                    {
                        title: "Сериализация в JSON. JsonSerializer",
                        avatar: `/logo-cs.png`,
                        progress: Math.random(),
                        is_complete: false,
                        url: "/courses/cs/course22/lesson1"
                    }]
            }, {
                title: "Работа с XML в C#",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course22/exam",
                lessons: []
            }, {
                title: "Процессы и домены приложения",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course23/exam",
                lessons: []
            }, {
                title: "Валидация модели",
                avatar: `/logo-cs.png`,
                progress: Math.random(),
                is_complete: false,
                is_lock: true,
                is_exam_complete: false,
                exam_url: "courses/cs/course24/exam",
                lessons: []
            }
        ],
        lang_title: "C#"
    },
    js: {
        themes: [
            {
                title: "Введение в JavaScript",
                avatar: `/logo-js.png`,
                progress: 1,
                is_complete: true,
                is_lock: false,
                is_exam_complete: true,
                exam_url: "courses/js/course1/exam",
                lessons: [{
                    title: "Что такое JavaScript",
                    avatar: `/course_ico/js/1/1.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/js/course1/lesson1"
                }, {
                    title: "Первая программа на JavaScript",
                    avatar: `/course_ico/js/1/2.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/js/course1/lesson2"
                }, {
                    title: "Выполнение кода javascript",
                    avatar: `/course_ico/js/1/3.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/js/course1/lesson3"
                }, {
                    title: "Подключение внешнего файла JavaScript",
                    avatar: `/course_ico/js/1/4.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/js/course1/lesson4"
                }, {
                    title: "Консоль браузера, console.log и document.write",
                    avatar: `/course_ico/js/1/5.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/js/course1/lesson5"
                }]
            }],
        lang_title: "JavaScript"
    },
    php: {
        themes: [
            {
                title: "Введение в PHP",
                avatar: `/logo-php.png`,
                progress: 1,
                is_complete: false,
                is_lock: false,
                is_exam_complete: false,
                exam_url: "courses/php/course1/exam",
                lessons: [{
                    title: "Общий обзор языка программирования PHP",
                    avatar: `/course_ico/php/1/1.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/php/course1/lesson1"
                }, {
                    title: "Установка PHP",
                    avatar: `/course_ico/php/1/2.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/php/course1/lesson2"
                }, {
                    title: "Установка веб-сервера Apache",
                    avatar: `/course_ico/php/1/3.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/php/course1/lesson3"
                }, {
                    title: "Установка MySQL",
                    avatar: `/course_ico/php/1/4.png`,
                    progress: 1,
                    is_complete: true,
                    url: "/courses/php/course1/lesson4"
                }, {
                    title: "Первый сайт на PHP",
                    avatar: `/course_ico/php/1/5.png`,
                    progress: 0.8,
                    is_complete: false,
                    url: "/courses/php/course1/lesson5"
                }]
            }],
        lang_title: "PHP"
    }
};

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
        login: "Bob cotik",
        text: "Курсы интересный,люди отличные,вообщем всё замечательно,but picture shit poligon",
        status: "продажный",
        avatar: `/avatars/ava1.png`
    }, {
        login: "ye.sb",
        text: "свадьба хорошая и конкурсы интересные",
        status: "самогоногон",
        avatar: `/avatars/ava17.png`
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
    let rndItem = () => {
        let theme = Math.randomizeArray(langs[Math.randomizeArray(["cs", "js", "php"])].themes);
        return {...Math.randomizeArray(theme.lessons), is_lock: theme.is_lock};
    };
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
        slider_items: [rndItem(), rndItem(), rndItem(), rndItem(), rndItem(), rndItem(), rndItem()]
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Courses(app, db, req, res) {
    let lang = req.query.lang || "cs";
    let themes;
    let lang_title;
    switch (lang) {
        case "cs":
            themes = langs.cs.themes;
            lang_title = langs.cs.lang_title;
            break;
        case "js":
            themes = langs.js.themes;
            lang_title = langs.js.lang_title;
            break;
        case "php":
            themes = langs.php.themes;
            lang_title = langs.php.lang_title;
            break;
        default:
            break
    }
    res.render(path.join(__dirname, "courses", "index.pug"), {
        basedir: path.join(__dirname, "courses"),
        current_page: "courses",
        lang,
        lang_title,
        themes,
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
        },
        themes: [
            {
                avatar: `/logo-${Math.randomizeArray(["js", "php", "cs"])}.png`,
                title: "Тема 1",
                last_message: "Габе жив",
                url: "/forum/theme1"
            },
            {
                avatar: `/logo-${Math.randomizeArray(["js", "php", "cs"])}.png`,
                title: "Тема 2",
                last_message: "Габе жив",
                url: "/forum/theme2"
            },
            {
                avatar: `/logo-${Math.randomizeArray(["js", "php", "cs"])}.png`,
                title: "Тема 3",
                last_message: "Габе жив",
                url: "/forum/theme3"
            },
            {
                avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
                title: "Тема 4",
                last_message: "Габе жив",
                url: "/forum/theme4"
            },
            {
                avatar: `/logo-${Math.randomizeArray(["js", "php", "cs"])}.png`,
                title: "Тема 5",
                last_message: "Габе жив",
                url: "/forum/theme5"
            },
            {
                avatar: `/logo-${Math.randomizeArray(["js", "php", "cs"])}.png`,
                title: "Тема 6",
                last_message: "Габе жив",
                url: "/forum/theme6"
            },
            {
                avatar: `/logo-${Math.randomizeArray(["js", "php", "cs"])}.png`,
                title: "Тема 7",
                last_message: "Габе жив",
                url: "/forum/theme7"
            }
        ]

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
    res.redirect(301, 'https://youtube.com/watch?v=oHg5SJYRHA0');
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
    if (err) {
        console.error(err);
        await Route_Error(res, err.code, "Ну чё, сломал?", err.message);
    } else
        res.end(page);
}
