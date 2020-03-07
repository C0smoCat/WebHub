const path = require("path");
const config = require("../config.js");
const pug = require('pug');
const fs = require('fs');
const express = require('express');
const hljs = require('highlight.js');
const markdown_it_container = require('markdown-it-container');
const markdown = require('markdown-it')({
    html: true,
    linkify: false,
    typographer: true,
    breaks: true,
    highlight: function (str, lang) {
        let lng = lang === "json5" ? "json" : lang;
        if (lng && hljs.getLanguage(lng)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(lng, str, true).value +
                    '</code></pre>';
            } catch (__) {
            }
        }
        return '<pre class="hljs"><code>' + markdown.utils.escapeHtml(str) + '</code></pre>';
    }
})
    .use(require("markdown-it-toc-and-anchor").default, {
        tocFirstLevel: 2,
        tocLastLevel: 4,
        anchorLinkBefore: true,
        anchorLinkSymbol: "#",
        wrapHeadingTextInAnchor: true
    })
    .use(require('markdown-it-attrs'))
    .use(require('markdown-it-header-sections'))
    .use(markdown_it_container, 'note', {
        validate: function (params) {
            return params.trim().match(/^note\s+(.*)$/);
        },
        render: function (tokens, idx) {
            if (tokens[idx].nesting === 1) {
                let m = tokens[idx].info.trim().match(/^note\s+(.*)$/);
                return `<div class='note note-${m[1]}'>\n`;
            } else {
                return '</div>\n';
            }
        }
    })
    .use(markdown_it_container, 'iframe', {
        validate: function (params) {
            return params.trim().match(/^iframe\s+(.*)$/);
        },
        render: function (tokens, idx) {
            if (tokens[idx].nesting === 1) {
                let m = tokens[idx].info.trim().match(/^iframe\s+(.*)$/);
                return `<div><iframe allowfullscreen frameborder="0" src="${m[1]}">`;
            } else {
                return '<pre>:( iframe not supported</pre></iframe></div>';
            }
        }
    })
    .use(markdown_it_container, 'spoiler', {
        validate: function (params) {
            return params.trim().match(/^spoiler\s+(.*)$/);
        },
        render: function (tokens, idx) {
            if (tokens[idx].nesting === 1) {
                let m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/);
                return `<details><summary>${m[1]}</summary>\n`;
            } else {
                return '</details>\n';
            }
        }
    });

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

let langs = require("./langs.js");

async function Route(app, db) {
    app.all(/\.(png|jpg|jpeg)$/, function (req, res) {
        let fpath = path.join(__dirname, "public", req.originalUrl);
        if (fs.existsSync(fpath))
            res.sendFile(fpath);
        else
            res.sendFile(path.join(__dirname, "public", "no-img.png"));
    });
    app.all("/", async function (req, res) {
        await Route_Index(app, db, req, res);
    });
    app.all("/forum", async function (req, res) {
        await Route_Forum(app, db, req, res);
    });
    app.all("/favicon.ico", function (req, res) {
        res.sendFile(path.join(__dirname, "public", "avatars", "ava7.png"));
    });
    app.all("/leaderboard", async function (req, res) {
        await Route_Leaderboard(app, db, req, res);
    });
    app.all("/play", async function (req, res) {
        await Route_Play(app, db, req, res);
    });
    app.all("/sandbox", async function (req, res) {
        await Route_Sandbox(app, db, req, res);
    });
    app.all("/login", async function (req, res) {
        await Route_Login(app, db, req, res);
    });
    app.all("/courses", async function (req, res) {
        await Route_Courses(app, db, req, res);
    });
    app.all("/courses/:lang/", async function (req, res) {
        await Route_Course(app, db, req, res);
    });
    app.all("/courses/:lang/:id_course/:id_lesson", async function (req, res) {
        await Route_Lesson(app, db, req, res);
    });
    app.all("/user", async function (req, res) {
        await Route_User(app, db, req, res);
    });
    app.all("/about", async function (req, res) {
        await Route_About(app, db, req, res);
    });
    app.all("/images/:image_hash", async function (req, res) {
        await Route_Images(app, db, req, res);
    });
    // app.all(/(go)?\/?(adm)?(iner)?\/?(phpmyadmin)?/, async function (req, res) {
    //     await RouteAdminer(app, db, req, res);
    // });
    app.all("*", async function (req, res) {
        await Route_Error(res, 404, "Страница не найдена", "");
    });
}

async function Route_Images(app, db, req, res) {
    let image_hash = req.params.image_hash;
    let sqlRes = await db.rquery(
        "select * from `files` where `id` = ?",
        [image_hash]);
    if (sqlRes.length <= 0) {
        res.sendStatus(404);
        return;
    }
    res
        .status(200)
        .contentType(sqlRes[0].file_type)
        .send(sqlRes[0].file_data);
}

async function Route_Index(app, db, req, res) {
    let comments = [
        {
            login: "Васян Пупкин",
            text: "Прошёл 228 курсов мне защло топ сайт",
            status: "кондитер",
            avatar: `/avatars/ava13.png`,
            is_premium: Math.randomInt(0, 5) === 0,
        }, {
            login: "Газиз",
            text: "Мне приснился кошмар где я кодил 5 дней подряд, а на 7 сделал Вовин сапёр.",
            status: "знаток mail.ru",
            avatar: `/avatars/ava14.png`,
            is_premium: Math.randomInt(0, 5) === 0,
        }, {
            login: "Azino777",
            text: "Сайт *****, курсы дешёвые. Можно заработать гораздо больше, всего лишь...",
            status: "online кино",
            avatar: `/avatars/ava15.png`,
            is_premium: Math.randomInt(0, 5) === 0,
        }, {
            login: "Данил",
            text: "Разработчики, добавьте побольше доната и рекламы. И Вова, не ломай сайт.",
            status: "¯\\_(ツ)_/¯",
            avatar: `/avatars/ava16.png`,
            is_premium: Math.randomInt(0, 5) === 0,
        }, {
            login: "Габе",
            text: "Борк-борк!",
            status: "живой",
            avatar: `/avatars/ava5.png`,
            is_premium: Math.randomInt(0, 5) === 0,
        }, {
            login: "Bob cotik",
            text: "Курсы интересный,люди отличные,вообщем всё замечательно,but picture shit poligon",
            status: "продажный",
            avatar: `/avatars/ava1.png`,
            is_premium: Math.randomInt(0, 5) === 0,
        }, {
            login: "ye.sb",
            text: "свадьба хорошая и конкурсы интересные",
            status: "самогоногон",
            avatar: `/avatars/ava17.png`,
            is_premium: Math.randomInt(0, 5) === 0,
        }, {
            login: "Среднекоммент",
            text: "Википе́дия — общедоступная многоязычная универсальная интернет-энциклопедия со свободным контентом, реализованная на принципах вики. Расположена по адресу www.wikipedia.org. Владелец сайта — американская некоммерческая организация «Фонд Викимедиа», имеющая 37 региональных представительств",
            status: "тест-тест",
            avatar: `/avatars/ava4.png`,
            is_premium: Math.randomInt(0, 5) === 0,
        }, {
            login: "Длиннокоммент",
            text: "В отличие от традиционных энциклопедий, таких, как Encyclopædia Britannica, ни одна статья в Википедии не проходит формального процесса экспертной оценки. Любая статья Википедии может редактироваться как с учётной записи участника, так даже и без регистрации на проекте (за исключением некоторых страниц, подверженных частому вандализму, которые доступны для изменения только определённым категориям участников или, в крайних случаях, только администраторам Википедии), и при этом все внесённые в статью изменения незамедлительно становятся доступными для просмотра любыми пользователями. Поэтому Википедия «не гарантирует истинность» своего содержимого, ведь в любом случае между моментом, когда в статью будет внесена какая-то недостоверная информация, и моментом, когда эта информация будет удалена из статьи другим участником Википедии (более компетентным в данной области знания), пройдёт определённое время. (Естественно, для того, чтобы обнаружить и удалить из статьи явный вандализм, нужно намного меньше времени, чем для того, чтобы освободить статью от недостоверной информации, когда подобная недостоверность не является особо очевидной.) Содержимое Википедии подпадает под действие законов (в частности, авторского права) штата Флорида в США, где находятся серверы Википедии, и нескольких редакционных политик и руководств, которые призваны укрепить идею о том, что Википедия является энциклопедией.",
            status: "тест-тест",
            avatar: `/avatars/ava12.png`,
            is_premium: Math.randomInt(0, 5) === 0,
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

async function Route_Course(app, db, req, res) {
    let lang_id = req.params.lang;
    let lang;
    if (langs[lang_id])
        lang = langs[lang_id];
    else {
        res.redirect(301, '/courses');
        return;
    }
    res.render(path.join(__dirname, "course", "index.pug"), {
        basedir: path.join(__dirname, "course"),
        current_page: "course",
        lang,
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        }
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Courses(app, db, req, res) {
    let langsMap = Object.keys(langs).map(lang_id => {
        return {
            title: langs[lang_id].lang_title,
            lang_id,
            progress: Math.random() < 0.2 ? 1 : Math.random(),
            background: langs[lang_id].background
        };
    }).sort((a, b) => b.progress - a.progress);
    res.render(path.join(__dirname, "courses", "index.pug"), {
        basedir: path.join(__dirname, "courses"),
        current_page: "courses",
        langs: langsMap,
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
    let search_query = req.query.q;
    let regex = new RegExp(search_query, 'i');
    let themes = [
        {
            avatar: `/logo-cs.png`,
            title: "C# - лучший язык программирования!",
            last_message: "Безусловно, C# - это язык, который можно использовать для самых различных целей. Если же вас волнует, насколько он конкурентоспособен, то можем вас уверить: он используется повсеместно. Также стоит принять во внимание, что этот язык достаточно легко выучить.",
            url: "/forum/1"
        },
        {
            avatar: `/logo-py.png`,
            title: "Python - лучший язык программирования!",
            last_message: "В недавнем исследовании касаемо популярности и используемости языков программирования выяснилось, что многие люди используют не Python, а другие языки. Однако большинство опрошенных также признались, что в самом скором времени планируют его изучить – а это уже говорит о многом.",
            url: "/forum/2"
        },
        {
            avatar: `/logo-java.png`,
            title: "Java - лучший язык программирования!",
            last_message: "Java также можно использовать для любых платформ. Он подойдет для разработки приложений для Android и iOS, а также для операционных систем Linux и Mac.",
            url: "/forum/3"
        },
        {
            avatar: `/logo-php.png`,
            title: "PHP - лучший язык программирования!",
            last_message: "Мы прекрасно знаем, что данный язык вряд ли можно назвать таким уж удобным и функциональным – тем более он уж точно не относится к любимчикам программистов. Действительно, можно сказать много всего нехорошего про PHP, однако есть всего один крайне существенный факт, который перекроет любые негативные комментарии касаемо этого языка.",
            url: "/forum/4"
        },
        {
            avatar: `/logo-swift.png`,
            title: "Swift - лучший язык программирования!",
            last_message: "Существует крайне очевидная причина выбрать Swift в качестве следующего языка для изучения. И эта причина – iPhone.",
            url: "/forum/5"
        },
        {
            avatar: `/logo-kotlin.png`,
            title: "Kotlin - лучший язык программирования!",
            last_message: "Многие эксперты в области программирования считают, что большая часть разработок на android будет переведена на этот язык – точно так же, как и разработка с Objective C была переведена на Swift. Поэтому, если вы задумались об изучении нового языка программирования, то Kotlin – это крайне многообещающий вариант.",
            url: "/forum/6"
        },
        {
            avatar: `/logo-cpp.png`,
            title: "C++ - лучший язык программирования!",
            last_message: "Если вы хотите влиться в создание игр виртуальной реальности, то C и C++ предоставят вам прекрасную возможность проявить себя.",
            url: "/forum/7"
        }
    ];
    res.render(path.join(__dirname, "forum", "index.pug"), {
        basedir: path.join(__dirname, "forum"),
        current_page: "forum",
        search_query,
        user: {
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4)
        },
        themes: search_query ? themes.filter(v => regex.test(v.title) || regex.test(v.last_message)) : themes
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Leaderboard(app, db, req, res) {
    let usr = {
        login: "Васян Пупкин",
        avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
        score: Math.randomInt(1, 16),
        status: "кондитер",
        is_premium: Math.random() < 0.5,
        crown_type: Math.randomInt(0, 4),
        place_num: -1
    };
    res.render(path.join(__dirname, "leaderboard", "index.pug"), {
        basedir: path.join(__dirname, "leaderboard"),
        current_page: "leaderboard",
        user: {
            login: "Пупкин Васян",
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4),
            score: Math.randomInt(1, 16),
            status: "кондитер",
            place_num: Math.randomInt(100, 1000)
        },
        leaderboard: [usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr]
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

async function Route_Lesson(app, db, req, res) {
    let lang_id = req.params.lang;
    let id_course = req.params.id_course;
    let id_lesson = req.params.id_lesson;
    let lang;
    let course;
    let lesson;
    if ((lang = langs[lang_id]) === undefined ||
        (course = langs[lang_id].themes[id_course - 1]) === undefined ||
        (lesson = langs[lang_id].themes[id_course - 1].lessons[id_lesson - 1]) === undefined) {
        await Route_Error(res, 228, "Урок не найден");
        return;
    }
    let lessonMd;
    let compiledMd;
    let mdPath = path.join(__dirname, "lesson", "lessons", lang_id, id_course, `${id_lesson}.md`);
    if (fs.existsSync(mdPath)) {
        lessonMd = fs.readFileSync(mdPath, "utf8");
        compiledMd = markdown.render(lessonMd);
    } else {
        await Route_Error(res, 1337, "Урок ещё не написан");
        return;
    }
    res.render(path.join(__dirname, "lesson", "index.pug"), {
        basedir: path.join(__dirname, "lesson"),
        current_page: "lesson",
        lang_id,
        id_course,
        id_lesson,
        lang,
        course,
        lesson,
        markdown: compiledMd,
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
    let langsMap = Object.keys(langs).map(lang_id => {
        return {
            title: langs[lang_id].lang_title,
            lang_id,
            progress: Math.random() < 0.2 ? 1 : Math.random(),
            background: langs[lang_id].background,
            avatar: "/logo-node.png"
        };
    }).sort((a, b) => b.progress - a.progress);
    res.render(path.join(__dirname, "user", "index.pug"), {
        basedir: path.join(__dirname, "user"),
        current_page: "user",
        langs: langsMap,
        user: {
            login: "Габе",
            avatar: `/avatars/ava${Math.randomInt(1, 16)}.png`,
            is_authorised: true,
            coins: Math.randomInt(0, 1000),
            is_premium: false,
            crown_type: Math.randomInt(0, 4),
            email: "gabe@the.dog",
            status: "живой",
            place_num: Math.randomInt(100, 10000)
        },
        certificates: ["/visa-bg.jpg", "/visa-bg-2.jpg", "/visa-bg-3.jpg", "/visa-bg-4.jpg"]
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

async function Route_Error(res, error_code, error_msg, error_desc = "", error_btn_url = "https://youtube.com/watch?v=oHg5SJYRHA0", error_btn_text = "Сделать хорошо") {
    res.render(path.join(__dirname, "error404", "index.pug"), {
        basedir: path.join(__dirname, "error404"),
        current_page: "error404",
        error_code,
        error_msg,
        error_desc,
        error_btn_url,
        error_btn_text
    }, (err, page) => HandleResult(err, page, res));
}

async function HandleResult(err, page, res) {
    if (err) {
        console.error(err);
        await Route_Error(res, err.code, "Ну чё, сломал?", err.message);
    } else
        res.end(page);
}
