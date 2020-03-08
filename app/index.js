const path = require("path");
const config = require("../config.js");
const pug = require('pug');
const fs = require('fs');
const express = require('express');
const crypto = require('crypto');
const hljs = require('highlight.js');
const url = require('url');
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

let langs = [];

async function Route(app, db) {
    app.all(/\.(png|jpg|jpeg)$/, function (req, res) {
        try {
            let fpath = path.join(__dirname, "public", req.originalUrl);
            if (fs.existsSync(fpath))
                res.sendFile(fpath);
            else
                res.sendFile(path.join(__dirname, "public", "no-img.png"));
        } catch (err) {
            res.sendStatus(500);
        }
    });
    app.all(/\.(css|js)$/, function (req, res) {
        try {
            let fpath = path.join(__dirname, "public", req.originalUrl);
            if (fs.existsSync(fpath))
                res.sendFile(fpath);
            else
                res.sendStatus(404);
        } catch (err) {
            res.sendStatus(500);
        }
    });
    app.all("/favicon.ico", async function (req, res) {
        try {
            res.sendFile(path.join(__dirname, "public", "gabe.png"));
        } catch (err) {
            res.sendStatus(500);
        }
    });
    app.all("/images/:image_hash", async function (req, res) {
        try {
            await Route_Images(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("*", async function (req, res, next) {
        await AuthUser(app, db, req, res, next);
    });
    app.all("/", async function (req, res) {
        try {
            await Route_Index(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/forum", async function (req, res) {
        try {
            await Route_Forum(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/leaderboard", async function (req, res) {
        try {
            await Route_Leaderboard(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/play", async function (req, res) {
        try {
            await Route_Play(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/sandbox", async function (req, res) {
        try {
            await Route_Sandbox(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/login", async function (req, res) {
        try {
            await Route_Login(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/logout", async function (req, res) {
        try {
            await Route_Logout(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/courses/:lang_id/", async function (req, res) {
        try {
            await Route_Course(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/courses", async function (req, res) {
        try {
            await Route_Courses(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/lessons/:id_lesson", async function (req, res) {
        try {
            await Route_Lesson(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/user", async function (req, res) {
        try {
            await Route_User(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/user/:user_id", async function (req, res) {
        try {
            await Route_User(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("/about", async function (req, res) {
        try {
            await Route_About(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all(/(go|adm|adminer|phpmyadmin)\/?(go|adm|adminer|phpmyadmin)?\/?(go|adm|adminer|phpmyadmin)?\/?/, async function (req, res) {
        try {
            await RouteAdminer(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("*", async function (req, res) {
        await Route_Error(res, 404, "Страница не найдена", "");
    });
}

async function ShowError(res, err) {
    console.error(err);
    await Route_Error(res, 500, "Ошибка на сервере", undefined, "/", "На главную");
}

async function AuthUser(app, db, req, res, next) {
    let user = {
        is_authorised: false,
        avatar: "/images/343d0c59d68c596cdaf3f0e08ad2537f",
        login: "Гость",
        sex_is_boy: true,
        status: "Гость",
        is_premium: false
    };
    if (req.cookies.token) {
        let user_info = (await db.rquery(`select t.\`token\`,
                                                 t.\`expire_time\`,
                                                 t.\`client_ip\`,
                                                 t.\`user_client\`,
                                                 t.\`create_time\`                                                   token_create_time,
                                                 u.\`id\` as                                                         user_id,
                                                 u.\`login\`,
                                                 u.\`password_hash\`,
                                                 u.\`create_time\`,
                                                 u.\`sex_is_boy\`,
                                                 u.\`ava_file_id\`,
                                                 u.\`status\`,
                                                 u.\`email\`,
                                                 u.\`premium_expire\`,
                                                 (u.\`premium_expire\` is not null AND u.\`premium_expire\` > NOW()) is_premium,
                                                 (u.\`last_active\` is not null AND u.\`last_active\` > NOW())       is_online,
                                                 u.\`coins\`,
                                                 u.\`last_active\`
                                          from \`access_tokens\` t
                                                   inner join users u on t.user_id = u.id
                                          where t.\`token\` = ?`, [req.cookies.token]))[0];
        if (user_info && user_info.expire_time >= Date.now()) {
            await db.rquery(`update \`users\`
                             set \`last_active\`=NOW()
                             where \`id\` = ?`, [user_info.user_id]);
            user = user_info;
            user.is_authorised = true;
            user.avatar = `/images/${user.ava_file_id}`;
        }
    }
    req.user = user;
    next();
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
    let recommended_lessons = await db.rquery(`SELECT l.id,
                                                      l.title,
                                                      COALESCE(l.avatar, t.avatar, g.avatar) avatar,
                                                      IF(RAND() < 0.2, 1, RAND())            progress
                                               FROM lessons l
                                                        inner join lessons_themes t on l.lesson_theme_id = t.id
                                                        inner join langs g on t.lang = g.id
                                               ORDER BY rand()
                                               LIMIT 10`);
    recommended_lessons.forEach(v => v.avatar = `/images/${v.avatar}`);
    let counts = await db.rquery("SELECT (select count(*) from `users`) as users_count, (select count(*) from `users` where (`last_active` IS NOT NULL AND `last_active` >= DATE_SUB(NOW(), INTERVAL ? second))) as online_count, (select count(*) from `lessons`) as lessons_count", 5 * 60);
    res.render(path.join(__dirname, "index", "index.pug"), {
        basedir: path.join(__dirname, "index"),
        current_page: "index",
        current_url: req.url,
        is_big_topnav: true,
        count_online: counts[0].online_count,
        count_users: counts[0].users_count,
        count_lessons: counts[0].lessons_count,
        comments: [Math.randomizeArray(comments), Math.randomizeArray(comments), Math.randomizeArray(comments)],
        user: req.user,
        slider_items: recommended_lessons
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Course(app, db, req, res) {
    let lang_id = req.params.lang_id;
    let course = await db.rquery(`SELECT l.\`title\`                            lesson_title,
                                         l.\`id\`                               lesson_id,
                                         IF(RAND() < 0.2, 1, RAND())            lesson_progress,
                                         COALESCE(l.avatar, t.avatar, g.avatar) lesson_avatar,
                                         t.\`title\`                            theme_title,
                                         t.\`id\`                               theme_id,
                                         COALESCE(t.avatar, g.avatar)           theme_avatar,
                                         g.\`title\`                            lang_title,
                                         g.\`background\`                       lang_background,
                                         g.\`id\`                               lang_id,
                                         g.avatar                               lang_avatar
                                  FROM langs g
                                           inner join lessons_themes t on g.id = t.lang
                                           inner join lessons l on t.id = l.lesson_theme_id
                                  where g.id = ?`, [lang_id]);
    if (!course || course.length <= 0) {
        res.redirect('/courses');
        return;
    }

    course = {
        background: course[0].lang_background,
        title: course[0].lang_title,
        avatar: `/images/${course[0].lang_avatar}`,
        url: `/courses/${lang_id}`,
        themes: course.reduce((prev, now) => {
            let themeIndex = prev.findIndex(v => v.id === now.theme_id);
            if (themeIndex < 0) {
                themeIndex = prev.length;
                prev.push({
                    title: now.theme_title,
                    id: now.theme_id,
                    url: `/courses/${lang_id}#${themeIndex + 1}`,
                    avatar: `/images/${now.theme_avatar}`,
                    lessons: []
                });
            }
            prev[themeIndex].lessons.push({
                title: now.lesson_title,
                id: now.lesson_id,
                progress: now.lesson_progress,
                url: `/lessons/${now.lesson_id}`,
                avatar: `/images/${now.lesson_avatar}`
            });
            return prev;
        }, [])
    };

    res.render(path.join(__dirname, "course", "index.pug"), {
        basedir: path.join(__dirname, "course"),
        current_page: "course",
        current_url: req.url,
        course,
        user: req.user
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Courses(app, db, req, res) {
    let langs = await db.rquery(`SELECT g.id, g.title, g.background, g.avatar, IF(RAND() < 0.2, 1, RAND()) as progress
                                 from langs g
                                 order by progress desc`);
    langs.forEach(v => v.avatar = `/images/${v.avatar}`);
    res.render(path.join(__dirname, "courses", "index.pug"), {
        basedir: path.join(__dirname, "courses"),
        current_page: "courses",
        current_url: req.url,
        langs,
        user: req.user
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
        current_url: req.url,
        search_query,
        user: req.user,
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
        current_url: req.url,
        user: Object.assign(req.user, {place_num: Math.randomInt(100, 1000), score: Math.randomInt(1, 16)}),
        leaderboard: [usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr, usr]
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Play(app, db, req, res) {
    res.render(path.join(__dirname, "play", "index.pug"), {
        basedir: path.join(__dirname, "play"),
        current_page: "play",
        current_url: req.url,
        user: req.user
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Sandbox(app, db, req, res) {
    res.render(path.join(__dirname, "sandbox", "index.pug"), {
        basedir: path.join(__dirname, "sandbox"),
        current_page: "sandbox",
        current_url: req.url,
        user: req.user
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Lesson(app, db, req, res) {
    let id_lesson = req.params.id_lesson;
    let lesson = (await db.rquery(`SELECT l.\`title\` as lesson_title,
                                          l.\`id\`       lesson_id,
                                          l.\`markdown\`,
                                          t.\`title\` as theme_title,
                                          t.\`id\`    as theme_id,
                                          g.\`title\` as lang_title,
                                          g.\`id\`    as lang_id
                                   FROM lessons l
                                            inner join lessons_themes t on l.lesson_theme_id = t.id
                                            inner join langs g on t.lang = g.id
                                   where l.id = ?`, [id_lesson]))[0];
    if (!lesson) {
        await Route_Error(res, 404, "Урок не найден");
        return;
    }
    lesson.lang_url = `/courses/${lesson.lang_id}`;
    lesson.theme_url = `/courses/${lesson.lang_id}#part${lesson.theme_id}`;
    let compiledMd = markdown.render(lesson.markdown);
    res.render(path.join(__dirname, "lesson", "index.pug"), {
        basedir: path.join(__dirname, "lesson"),
        current_page: "lesson",
        current_url: req.url,
        lesson,
        markdown: compiledMd,
        user: req.user
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Login(app, db, req, res) {
    let auth_error = undefined;
    let isAuthOk = undefined;
    if (req.query.email && req.query.password && !req.query.is_reg)
        [auth_error, isAuthOk] = await TryAuthUser(app, db, req, res, req.query.email, req.query.password);
    if (isAuthOk) {
        res.redirect(req.query.redirect || "/");
        return;
    }
    res.render(path.join(__dirname, "login", "index.pug"), {
        basedir: path.join(__dirname, "login"),
        current_page: "login",
        current_url: req.url,
        auth_error,
        is_reg,
        email: req.query.email,
        redirect: req.query.redirect,
        user: req.user
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Logout(app, db, req, res) {
    if (!req.user.is_authorised) {
        res.redirect("/login");
        return;
    }
    await db.rquery("update `access_tokens` set `expire_time`=NOW() where `token`=?", [req.user.token]);
    res.cookie('token', undefined);
    res.redirect(req.query.redirect || "/");
}

async function TryAuthUser(app, db, req, res, email, password) {
    if (3 > email.length || email.length > 50 || 3 > password.length || password.length > 50)
        return ["Слишком короткий логин или пароль", false];
    let sqlRes1 = await db.rquery(
        "SELECT * from `users` WHERE (`email` = ?) AND (`password_hash` = MD5(?)) limit 1",
        [email, password]);
    if (sqlRes1.length <= 0)
        return ["Пользователь не найден", false];
    let user_id = sqlRes1[0].id;

    let sqlRes2 = await db.rquery(
        "SELECT * from `access_tokens` WHERE (`expire_time` > NOW()) AND (`user_id` = ?)",
        [user_id]);

    if (sqlRes2.length >= 3)
        return ["Превышен лимит авторизаций", false];

    let token = crypto.createHash('md5').update(`${email} ${Math.random()} ${password} ${Math.random()}`).digest("hex");
    let client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let client_agent = req.headers['user-agent'] || "unknown";
    await db.rquery(
        "INSERT INTO `access_tokens` (`token`, `user_id`, `expire_time`, `client_ip`, `user_client`, `create_time`) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? day), ?, ?, NOW())",
        [token, user_id, 30, client_ip, client_agent]);
    await db.rquery("update `users` set `last_active`=NOW() where `id`=?", [user_id]);
    res.cookie('token', token);
    return [undefined, true];
}

async function Route_User(app, db, req, res) {
    let user_id = req.params.user_id || req.user.id;
    if (!user_id) {
        res.redirect(url.format({
            pathname: "/login",
            query: {"redirect": `/user`}
        }));
        return;
    }

    let langs = await db.rquery(`SELECT g.id, g.title, g.background, g.avatar, IF(RAND() < 0.2, 1, RAND()) as progress
                                 from langs g
                                 order by progress desc`);
    langs.forEach(v => v.avatar = `/images/${v.avatar}`);

    res.render(path.join(__dirname, "user", "index.pug"), {
        basedir: path.join(__dirname, "user"),
        current_page: "user",
        current_url: req.url,
        langs,
        user: Object.assign(req.user, {place_num: Math.randomInt(100, 1000), score: Math.randomInt(1, 16)}),
        certificates: ["/visa-bg.jpg", "/visa-bg-2.jpg", "/visa-bg-3.jpg", "/visa-bg-4.jpg"]
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_About(app, db, req, res) {
    res.render(path.join(__dirname, "about", "index.pug"), {
        basedir: path.join(__dirname, "about"),
        current_page: "about",
        current_url: req.url,
        user: req.user
    }, (err, page) => HandleResult(err, page, res));
}

async function RouteAdminer(app, db, req, res) {
    res.redirect('https://youtube.com/watch?v=oHg5SJYRHA0');
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