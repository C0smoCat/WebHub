const path = require("path");
const config = require("../config.js");
const pug = require('pug');
const fs = require('fs');
const express = require('express');
const md5File = require('md5-file');
const crypto = require('crypto');
const multer = require('multer')({dest: `${__dirname}/uploads`});
const hljs = require('highlight.js');
const url = require('url');
const markdown_it_container = require('markdown-it-container');
const markdown = require('markdown-it')({
    html: false,
    linkify: true,
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
    .use(markdown_it_container, 'tip', {
        validate: function (params) {
            return params.trim().match(/^tip\s+(.*)$/);
        },
        render: function (tokens, idx) {
            if (tokens[idx].nesting === 1) {
                let m = tokens[idx].info.trim().match(/^tip\s+(.*)\|(.*)$/);
                return `<div class="tooltip">${m[1]}<span class="tooltiptext">${m[2]}</span></div>`;
            } else {
                return '';
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

module.exports = async function Route(app, db) {
    app.get(/\.(png|jpg|jpeg|svg)$/, function (req, res, next) {
        try {
            if (/^\/myadmin/.test(req.url)) {
                next();
                return;
            }
            let fpath = path.join(__dirname, "public", req.originalUrl);
            if (fs.existsSync(fpath))
                res.sendFile(fpath);
            else
                res.sendFile(path.join(__dirname, "public", "no-img.png"));
        } catch (err) {
            res.sendStatus(500);
        }
    });
    app.get(/.*\.\w{2,5}$/, function (req, res, next) {
        try {
            if (/^\/myadmin/.test(req.url)) {
                next();
                return;
            }
            let fpath = path.join(__dirname, "public", req.originalUrl);
            if (fs.existsSync(fpath))
                res.sendFile(fpath);
            else
                res.sendStatus(404);
        } catch (err) {
            res.sendStatus(500);
        }
    });
    app.get("/favicon.ico", async function (req, res) {
        try {
            res.sendFile(path.join(__dirname, "public", "gabe.png"));
        } catch (err) {
            res.sendStatus(500);
        }
    });
    app.get("/images/:image_hash", async function (req, res) {
        try {
            await Route_Images(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("*", async function (req, res, next) {
        try {
            await AuthUser(app, db, req, res, next);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/", async function (req, res) {
        try {
            await Route_Index(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/forum", async function (req, res) {
        try {
            await Route_Forum(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/forum/:theme_id", async function (req, res) {
        try {
            await Route_ForumMessages(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/leaderboard", async function (req, res) {
        try {
            await Route_Leaderboard(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/play", async function (req, res) {
        try {
            await Route_Play(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/sandbox", async function (req, res) {
        try {
            await Route_Sandbox(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/login", async function (req, res) {
        try {
            await Route_Login(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.post("/login", multer.single("avatar"), async function (req, res) {
        try {
            await Route_Login(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/logout", async function (req, res) {
        try {
            await Route_Logout(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/courses/:lang_id/", async function (req, res) {
        try {
            await Route_Course(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/courses", async function (req, res) {
        try {
            await Route_Courses(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/lessons/:id_lesson", async function (req, res) {
        try {
            await Route_Lesson(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/lessons/:id_lesson/complete", async function (req, res) {
        try {
            await Route_Lesson_Complete(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/user", async function (req, res) {
        try {
            await Route_User(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/user/:user_id", async function (req, res) {
        try {
            await Route_User(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/about", async function (req, res) {
        try {
            await Route_About(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.get("/notifications", async function (req, res) {
        try {
            await Route_Notifications(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all(/^\/(go|myadmin|adm|adminer|phpmyadmin)\/?(go|myadmin|adm|adminer|phpmyadmin)?\/?(go|myadmin|adm|adminer|phpmyadmin)?\/?/, async function (req, res, next) {
        try {
            if (/^\/myadmin/.test(req.url) && req.user.is_authorised && req.user.is_admin) {
                next();
                return;
            }
            await RouteAdminer(app, db, req, res);
        } catch (err) {
            await ShowError(res, err);
        }
    });
    app.all("*", async function (req, res, next) {
        if (/^\/myadmin/.test(req.url) && req.user.is_authorised && req.user.is_admin) {
            next();
            return;
        }
        await Route_Error(res, 404, "Страница не найдена", undefined, "/", "На главную");
    });
};

async function ShowError(res, err) {
    console.error(err);
    await Route_Error(res, 500, "Ошибка на сервере", undefined, "/", "На главную");
}

async function AuthUser(app, db, req, res, next) {
    let user = {
        is_authorised: false,
        avatar: "/images/3796bdb393cadd034e2d78f046eaf5b9",
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
                                                 u.\`id\`                                                            user_id,
                                                 u.\`login\`,
                                                 u.\`password_hash\`,
                                                 u.\`create_time\`,
                                                 u.\`sex_is_boy\`,
                                                 u.\`ava_file_id\`,
                                                 u.\`status\`,
                                                 u.\`email\`,
                                                 u.\`premium_expire\`,
                                                 (u.\`premium_expire\` is not null AND u.\`premium_expire\` > NOW()) is_premium,
                                                 u.is_admin,
                                                 u.\`coins\`,
                                                 u.\`last_active\`,
                                                 u.\`score\`                                                         score,
                                                 count(n.id)                                                         notifications_unread_count
                                          from \`access_tokens\` t
                                                   inner join users u on t.user_id = u.id
                                                   inner join notifications n on u.id = n.user_id and not n.is_read
                                          where t.\`token\` = ?`, [req.cookies.token]))[0];
        if (user_info && user_info.expire_time >= Date.now()) {
            user = user_info;
            user.is_premium = user.is_premium === 1;
            user.is_admin = user.is_admin === 1;
            user.is_online = true;
            if (user.last_active && Date.now() - user.last_active.getTime() > 24 * 60 * 60 * 1000) {
                let bonusRating = 10;
                if (user.is_premium) {
                    bonusRating = 25;
                    await db.rquery(`UPDATE users u
                                     SET u.score = u.score + ?
                                     where u.id = ?`, [bonusRating, user.user_id]);
                } else {
                    await db.rquery(`UPDATE users u
                                     SET u.score = u.score + ?
                                     where u.id = ?`, [bonusRating, user.user_id]);
                }
                await PushNotification(db, user.user_id, "Ежедневный вход", `Вам начислено ${bonusRating} рейтинга за то, что вы с нами! Ваш текущий рейтинг: ${user.rating + bonusRating}.`);
            }

            await db.rquery(`update \`users\`
                             set \`last_active\`=NOW()
                             where \`id\` = ?`, [user.user_id]);

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
    let recommended_lessons = req.user.is_authorised ?
        await db.rquery(`SELECT l.id,
                                l.title,
                                COALESCE(l.avatar, t.avatar, g.avatar) avatar,
                                ulp.progress                           progress,
                                utp.is_available                       theme_is_avaliable,
                                utp.is_exam_complete                   is_exam_complete
                         FROM lessons l
                                  inner join lessons_themes t on l.lesson_theme_id = t.id
                                  inner join langs g on t.lang = g.id
                                  left outer join user_lesson_progress ulp on l.id = ulp.lesson_id and ulp.user_id = ?
                                  left outer join user_theme_progress utp
                                                  on t.id = utp.lessons_theme_id and utp.user_id = ?
                         WHERE utp.is_available is not null
                           AND utp.is_available is true
                         ORDER BY rand()
                         LIMIT 10`, [req.user.user_id, req.user.user_id]) :
        await db.rquery(`SELECT l.id,
                                l.title,
                                COALESCE(l.avatar, t.avatar, g.avatar) avatar,
                                0                                      progress,
                                false                                  theme_is_avaliable,
                                false                                  is_exam_complete
                         FROM lessons l
                                  inner join lessons_themes t on l.lesson_theme_id = t.id
                                  inner join langs g on t.lang = g.id
                         ORDER BY rand()
                         LIMIT 10`, []);
    let comments = await db.rquery(`SELECT c.id,
                                           c.text,
                                           c.create_time,
                                           u.ava_file_id                                                       avatar,
                                           c.lesson_id,
                                           u.id                                                                user_id,
                                           u.login,
                                           u.status,
                                           u.is_admin,
                                           (u.\`premium_expire\` is not null AND u.\`premium_expire\` > NOW()) is_premium,
                                           (u.\`last_active\` IS NOT NULL AND
                                            u.\`last_active\` >= DATE_SUB(NOW(), INTERVAL ? second))           is_online,
                                           l.title
                                    FROM user_lessons_comments c
                                             inner join users u on c.user_id = u.id
                                             inner join lessons l on c.lesson_id = l.id
                                    ORDER BY rand()
                                    LIMIT 3`, [5 * 60]);
    comments.forEach(v => {
        v.avatar = `/images/${v.avatar}`;
        v.is_premium = v.is_premium === 1;
        v.user_url = `/user/${v.user_id}`;
        v.is_online = v.is_online === 1;
        v.is_admin = v.is_admin === 1;
    });
    recommended_lessons.forEach(v => {
        v.avatar = `/images/${v.avatar}`;
        v.is_lock = (v.theme_is_avaliable || 0) !== 1
    });
    let counts = await db.rquery("SELECT (select count(*) from `users`) as users_count, (select count(*) from `users` where (`last_active` IS NOT NULL AND `last_active` >= DATE_SUB(NOW(), INTERVAL ? second))) as online_count, (select count(*) from `lessons`) as lessons_count", 5 * 60);
    res.render(path.join(__dirname, "index", "index.pug"), {
        basedir: path.join(__dirname, "index"),
        current_page: "index",
        current_url: req.url,
        is_big_topnav: true,
        count_online: counts[0].online_count,
        count_users: counts[0].users_count,
        count_lessons: counts[0].lessons_count,
        comments: comments,
        user: req.user,
        slider_items: recommended_lessons
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Course(app, db, req, res) {
    let lang_id = req.params.lang_id;
    let user_id = req.user.is_authorised ? req.user.user_id : 0;
    let course = await db.rquery(`SELECT l.\`title\`                            lesson_title,
                                         l.\`id\`                               lesson_id,
                                         COALESCE(l.avatar, t.avatar, g.avatar) lesson_avatar,
                                         t.\`title\`                            theme_title,
                                         t.\`id\`                               theme_id,
                                         COALESCE(t.avatar, g.avatar)           theme_avatar,
                                         g.\`title\`                            lang_title,
                                         g.\`background\`                       lang_background,
                                         g.\`id\`                               lang_id,
                                         g.avatar                               lang_avatar,
                                         ulp.progress                           lesson_progress,
                                         utp.is_available                       theme_is_avaliable,
                                         utp.is_exam_complete                   is_exam_complete
                                  FROM langs g
                                           inner join lessons_themes t on g.id = t.lang
                                           inner join lessons l on t.id = l.lesson_theme_id
                                           left outer join user_lesson_progress ulp on l.id = ulp.lesson_id and ulp.user_id = ?
                                           left outer join user_theme_progress utp
                                                           on t.id = utp.lessons_theme_id and utp.user_id = ?
                                  where g.id = ?`, [user_id, user_id, lang_id]);
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
                    is_lock: (now.theme_is_avaliable || 0) !== 1,
                    is_exam_complete: (now.is_exam_complete || 0) === 1,
                    exam_url: `/exam/${lang_id}/${themeIndex + 1}`,
                    url: `/courses/${lang_id}#${themeIndex + 1}`,
                    avatar: `/images/${now.theme_avatar}`,
                    lessons: []
                });
            }
            prev[themeIndex].lessons.push({
                title: now.lesson_title,
                id: now.lesson_id,
                progress: now.lesson_progress || 0,
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
    let search_query = `%${req.query.q || ""}%`;
    let page = req.query.page ? Number.parseInt(req.query.page) : 1;
    if (page < 1)
        page = 1;
    let dbThemes = await db.rquery("select * from `forum_themes` where (`title` like ?) or (`description` like ?) limit ?,15", [search_query || "%", search_query || "%", (page - 1) * 15]);
    let max_page = Math.ceil(dbThemes.length > 0 ? dbThemes[0].count / 15 : 1);
    let themes = dbThemes.map(v => {
        return {
            avatar: `/images/${v.avatar}`,
            title: v.title,
            description: v.description,
            descriptionMd: markdown.render(v.description),
            url: `/forum/${v.id}`,
            create_time: v.create_time
        };
    });
    res.render(path.join(__dirname, "forum", "index.pug"), {
        basedir: path.join(__dirname, "forum"),
        current_page: "forum",
        current_url: req.url,
        search_query: req.query.q || "",
        max_page,
        page: page,
        user: req.user,
        themes: themes
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_ForumMessages(app, db, req, res) {
    let theme_id = req.params.theme_id;
    let error_msg;
    let result_theme;
    let theme = await db.rquery(`select t.avatar,
                                        t.title,
                                        t.description,
                                        t.create_time,
                                        t.created_by,
                                        u.status,
                                        u.login,
                                        (u.\`premium_expire\` is not null AND u.\`premium_expire\` > NOW()) is_premium,
                                        (u.\`last_active\` is not null AND u.\`last_active\` > NOW())       is_online,
                                        u.ava_file_id                                                       user_avatar
                                 from forum_themes t
                                          inner join users u on t.created_by = u.id
                                 where t.id = ?`, [theme_id]);
    if (!theme || theme.length !== 1)
        error_msg = "Тема не найдена";
    else {
        theme = theme[0];
        let messages = await db.rquery(`select m.id,
                                               m.created_by                                                        created_by,
                                               m.create_time,
                                               m.text,
                                               u.status,
                                               u.login,
                                               (u.\`premium_expire\` is not null AND u.\`premium_expire\` > NOW()) is_premium,
                                               (u.\`last_active\` is not null AND u.\`last_active\` > NOW())       is_online,
                                               u.ava_file_id                                                       user_avatar
                                        from forum_messages m
                                                 inner join users u on m.created_by = u.id
                                                 inner join forum_themes t on m.forum_theme_id = t.id
                                        where t.id = ?`, [theme_id]);
        result_theme = {
            id: Number.parseInt(theme_id),
            title: theme.title,
            avatar: `/images/${theme.avatar}`,
            description: theme.description,
            descriptionMd: markdown.render(theme.description),
            create_time: theme.create_time,
            created_by: {
                id: theme.created_by,
                url: `/user/${theme.created_by}`,
                status: theme.status,
                login: theme.login,
                is_premium: theme.is_premium,
                is_online: theme.is_online,
                avatar: `/images/${theme.user_avatar}`
            },
            messages: messages.map(message => {
                return {
                    id: message.id,
                    text: message.text,
                    textMd: markdown.render(message.text),
                    create_time: message.create_time,
                    created_by: {
                        id: message.created_by,
                        url: `/user/${message.created_by}`,
                        status: message.status,
                        login: message.login,
                        is_premium: message.is_premium,
                        is_online: message.is_online,
                        avatar: `/images/${message.user_avatar}`
                    }
                };
            })
        };
    }
    res.render(path.join(__dirname, "forum_messages", "index.pug"), {
        basedir: path.join(__dirname, "forum_messages"),
        current_page: "forum_messages",
        current_url: req.url,
        error_msg,
        theme: result_theme,
        user: req.user
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Leaderboard(app, db, req, res) {
    let user = req.user.is_authorised ? (await db.rquery(`select ROW_NUMBER() OVER (ORDER BY score) place_num
                                                          from \`users\` u
                                                          where u.\`id\` = ?`, [req.user.user_id]))[0] : {};
    let leaderboard = (await db.rquery(`select u.\`id\`,
                                               u.\`login\`,
                                               u.\`ava_file_id\`,
                                               u.\`status\`,
                                               u.\`score\`,
                                               (u.\`premium_expire\` is not null AND u.\`premium_expire\` > NOW()) is_premium,
                                               (u.\`last_active\` IS NOT NULL
                                                   AND
                                                u.\`last_active\` >= DATE_SUB(NOW(), INTERVAL ? second))           is_online,
                                               # ROW_NUMBER() OVER (ORDER BY score)                                  place_num,
                                               u.score                                                             score
                                        from \`users\` u
                                        order by score desc
                                        limit 200`, [5 * 60]));
    leaderboard.forEach(v => {
        v.avatar = `/images/${v.ava_file_id}`;
        v.is_premium = v.is_premium === 1;
        v.url = `/user/${v.id}`;
        v.is_online = v.is_online === 1;
    });
    res.render(path.join(__dirname, "leaderboard", "index.pug"), {
        basedir: path.join(__dirname, "leaderboard"),
        current_page: "leaderboard",
        current_url: req.url,
        user: Object.assign(req.user, user),
        leaderboard
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
    let user_id = req.user.is_authorised ? req.user.user_id : 0;
    if (req.query.comment_text) {
        if (!req.user.is_authorised) {
            res.redirect(url.format({
                pathname: `/lessons/${id_lesson}`,
                query: {
                    comment_ok: 0,
                    comment_status: "Чтобы оставить комментарий вам необходимо авторизироваться"
                }
            }));
            return;
        }
        let text = req.query.comment_text;
        if (text < 3) {
            res.redirect(url.format({
                pathname: `/lessons/${id_lesson}`,
                query: {
                    comment_ok: 0,
                    comment_status: "Слишком короткий комментарий"
                }
            }));
        } else if (1024 < text) {
            res.redirect(url.format({
                pathname: `/lessons/${id_lesson}`,
                query: {
                    comment_ok: 0,
                    comment_status: "Слишком длинный комментарий"
                }
            }));
        } else {
            let is_dublicate_comment = await db.rquery(`SELECT c.id
                                                        FROM user_lessons_comments c
                                                        where \`text\` = ?
                                                          and user_id = ?
                                                          and lesson_id = ?`, [text, user_id, id_lesson]);
            if (is_dublicate_comment && is_dublicate_comment.length > 0) {
                res.redirect(url.format({
                    pathname: `/lessons/${id_lesson}`,
                    query: {
                        comment_ok: 1,
                        comment_status: "Комментарий уже опубликован"
                    },
                    hash: `comment_${is_dublicate_comment[0].id}`
                }));
            } else {
                let result = await db.rquery(`insert into user_lessons_comments(create_time, user_id, lesson_id, text, rating)
                                              values (now(), ?, ?, ?, 0)`, [user_id, id_lesson, text]);
                if (result.insertId) {
                    res.redirect(url.format({
                        pathname: `/lessons/${id_lesson}`,
                        query: {
                            comment_ok: 1,
                            comment_status: "Ваш комментарий опубликован"
                        },
                        hash: `comment_${result.insertId}`
                    }));
                } else {
                    res.redirect(url.format({
                        pathname: `/lessons/${id_lesson}`,
                        query: {
                            comment_ok: 0,
                            comment_status: "Неизвестная ошибка. Попробуйте позже"
                        }
                    }));
                }
            }
        }
        return;
    }
    let lesson = (await db.rquery(`SELECT l.\`title\`          lesson_title,
                                          l.\`id\`             lesson_id,
                                          l.\`next_lesson_id\` next_lesson_id,
                                          l.\`prev_lesson_id\` prev_lesson_id,
                                          l.\`id\`             lesson_id,
                                          l.\`markdown\`,
                                          t.\`title\`          theme_title,
                                          t.\`id\`             theme_id,
                                          g.\`title\`          lang_title,
                                          g.\`id\`             lang_id,
                                          ulp.progress         progress,
                                          utp.is_available     is_available,
                                          utp.is_exam_complete is_exam_complete
                                   FROM lessons l
                                            inner join lessons_themes t on l.lesson_theme_id = t.id
                                            inner join langs g on t.lang = g.id
                                            left outer join user_lesson_progress ulp on l.id = ulp.lesson_id and ulp.user_id = ?
                                            left outer join user_theme_progress utp
                                                            on t.id = utp.lessons_theme_id and utp.user_id = ?
                                   where l.id = ?`, [user_id, user_id, id_lesson]))[0];
    let comments = (await db.rquery(`SELECT c.id,
                                            c.text,
                                            c.create_time,
                                            c.rating,
                                            u.ava_file_id                                                       avatar,
                                            u.id                                                                user_id,
                                            u.login,
                                            u.status,
                                            u.is_admin,
                                            (u.\`premium_expire\` is not null AND u.\`premium_expire\` > NOW()) is_premium,
                                            (u.\`last_active\` IS NOT NULL AND
                                             u.\`last_active\` >= DATE_SUB(NOW(), INTERVAL ? second))           is_online
                                     FROM user_lessons_comments c
                                              inner join users u on c.user_id = u.id
                                     WHERE c.lesson_id = ?
                                     ORDER BY c.rating
                                     LIMIT 100`,
        [5 * 60, id_lesson]));
    comments = comments.map((v) => {
        return {
            id: v.id,
            login: v.login,
            text: v.text,
            status: v.status,
            avatar: `/images/${v.avatar}`,
            is_premium: v.is_premium === 1,
            is_admin: v.is_admin === 1,
            user_url: `/user/${v.user_id}`,
            is_online: v.is_online === 1,
            create_time: v.create_time,
            rating: v.rating,
            rating_up_url: v.rating_up_url,
            rating_down_url: v.rating_down_url,
            rating_mark_status: v.rating_mark_status
        }
    });
    if (!lesson) {
        await Route_Error(res, 404, "Урок не найден");
        return;
    }
    lesson.lang_url = `/courses/${lesson.lang_id}`;
    lesson.theme_url = `/courses/${lesson.lang_id}#part${lesson.theme_id}`;
    lesson.is_available = (lesson.is_available || 0) === 1;
    lesson.is_exam_complete = (lesson.is_exam_complete || 0) === 1;
    lesson.progress = lesson.progress || 0;
    let compiledMd = markdown.render(lesson.markdown);
    res.render(path.join(__dirname, "lesson", "index.pug"), {
        basedir: path.join(__dirname, "lesson"),
        current_page: "lesson",
        current_url: req.url,
        lesson,
        comments,
        markdown: compiledMd,
        user: req.user,
        comment_ok: req.query.comment_ok === "1",
        comment_status: req.query.comment_status
    }, (err, page) => HandleResult(err, page, res));
}

async function Route_Lesson_Complete(app, db, req, res) {
    let id_lesson = req.params.id_lesson;
    if (!req.user || !req.user.is_authorised) {
        res.redirect("/login");
        return;
    }
    let lesson = (await db.rquery(`SELECT l.\`title\`          lesson_title,
                                          t.\`id\`             theme_id,
                                          g.\`id\`             lang_id,
                                          ulp.progress         user_lesson_progress,
                                          utp.is_available     user_theme_is_avaliable,
                                          utp.is_exam_complete user_theme_is_exam_complete
                                   FROM lessons l
                                            inner join lessons_themes t on l.lesson_theme_id = t.id
                                            inner join langs g on t.lang = g.id
                                            left outer join user_lesson_progress ulp on l.id = ulp.lesson_id and ulp.user_id = ?
                                            left outer join user_theme_progress utp
                                                            on t.id = utp.lessons_theme_id and utp.user_id = ?
                                   where l.id = ?`, [req.user.user_id, req.user.user_id, id_lesson]))[0];
    if (!lesson)
        await Route_Error(res, 404, "Урок не найден");
    else if ((lesson.user_theme_is_avaliable || 0) === 1 && lesson.user_lesson_progress < 1) {
        await db.rquery(`INSERT INTO user_lesson_progress(user_id, lesson_id, progress)
                         VALUES (?, ?, 1)`, [req.user.user_id, id_lesson]);
        let bonusRating = 10;
        await PushNotification(db, req.user.user_id, "Начисление рейтинга", `За прохождение урока "${lesson.lesson_title}" вам начислено ${bonusRating} рейтинга. Ваш текущий рейтинг: ${req.user.rating + bonusRating}.`, `/lessons/${id_lesson}`);
        await db.rquery(`UPDATE users u
                         SET u.score = u.score + ?
                         where u.id = ?`, [10, req.user.user_id]);
    }
    res.redirect(`/courses/${lesson.lang_id}#part${lesson.theme_id}`);
}

async function Route_Login(app, db, req, res) {
    let auth_error = undefined;
    let isAuthOk = undefined;
    if (req.user.is_authorised) {
        res.redirect(req.query.redirect || "/");
        return;
    }
    if (Object.keys(req.body).length > 0)
        [auth_error, isAuthOk] = await TryAuthUser(app, db, req, res, req.body.email, req.body.password);
    if (isAuthOk) {
        res.redirect(req.query.redirect || "/");
        return;
    }
    res.render(path.join(__dirname, "login", "index.pug"), {
        basedir: path.join(__dirname, "login"),
        current_page: "login",
        current_url: req.url,
        auth_error,
        is_reg: req.query.is_reg === "true" || req.body.is_reg === "true",
        values: {
            login: req.body.login,
            status: req.body.status,
            email: req.body.email,
            password: req.body.password
        },
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
    if (3 > email.length || email.length > 50)
        return ["Слишком короткий или длинный email", false];
    if (3 > password.length || password.length > 50)
        return ["Слишком короткий или длинный пароль", false];
    if (req.body.is_reg === "true") {
        if (req.file && req.file.size > 1024 * 1024) // 1mb
            return ["Файл аватарки слишком большой", false];
        if (!req.body.status || 3 > req.body.status.length || req.body.status.length > 50)
            return ["Слишком короткий или длинный статус", false];
        if (!req.body.login || 3 > req.body.login.length || req.body.login.length > 50)
            return ["Слишком короткий или длинный логин", false];

        let sqlRes1 = await db.rquery(
            "SELECT * from `users` WHERE `email` = ? limit 1", [email]);

        if (!sqlRes1 || sqlRes1.length !== 0)
            return ["Email уже зянят", false];

        let avatar = "e9752157de38d306b4301b5b63d7af6e";
        if (req.file) {
            let file_hash = md5File.sync(req.file.path);
            avatar = file_hash;
            await db.rquery("INSERT INTO files(id, file_size, file_type, file_data) VALUES (?,?,?,LOAD_FILE(?)) ON DUPLICATE KEY UPDATE file_data = LOAD_FILE(?)",
                [file_hash, req.file.size, req.file.mimetype, req.file.path, req.file.path]);
        }
        let res = await db.rquery("insert into `users`(login, password_hash, create_time, sex_is_boy, ava_file_id, status, email, premium_expire, coins, last_active, score, last_score_update, is_admin) values (?,MD5(?),NOW(),?,?,?,?,DATE_ADD(NOW(), INTERVAL ? day),?,NOW(),0,NOW(),false)",
            [req.body.login, password, Math.random() < 0.5, avatar, req.body.status, email, 3, 0]);

        await PushToken(res.insertId);
        let welcome_lessons = await db.rquery(`select id
                                               from lessons_themes
                                               group by lang
                                               order by id`);
        await db.rquery(`insert into user_theme_progress(user_id, lessons_theme_id, is_available, is_exam_complete) VALUES ${welcome_lessons.map(v => `(${res.insertId},${v.id},true,false)`).join(", ")}`);

        return [undefined, true];
    } else {
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

        await PushToken(user_id);
        let client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let client_agent = req.headers['user-agent'] || "unknown";
        await PushNotification(db, user_id, "Авторизация в аккаунт", `Кто-то авторизировался в вашем аккаунте\nIP адрес: ${client_ip}\nUser-agent: ${client_agent}`);
        return [undefined, true];
    }

    async function PushToken(user_id) {
        let token = crypto.createHash('md5').update(`${email} ${Math.random()} ${password} ${Math.random()}`).digest("hex");
        let client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let client_agent = req.headers['user-agent'] || "unknown";
        await db.rquery(
            "INSERT INTO `access_tokens` (`token`, `user_id`, `expire_time`, `client_ip`, `user_client`, `create_time`) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? day), ?, ?, NOW())",
            [token, user_id, 30, client_ip, client_agent]);
        // await db.rquery("update `users` set `last_active`=NOW() where `id`=?", [user_id]);
        res.cookie('token', token);
    }
}

async function Route_User(app, db, req, res) {
    let user_id = req.params.user_id || req.user.id || req.user.user_id;
    let error_msg;
    let langs = [];
    if (!user_id) {
        res.redirect(url.format({
            pathname: "/login",
            query: {"redirect": `/user`}
        }));
        return;
    }

    let user_page = (await db.rquery(`select u.\`id\`,
                                             u.\`login\`,
                                             u.\`create_time\`,
                                             u.\`sex_is_boy\`,
                                             u.\`ava_file_id\`,
                                             u.\`status\`,
                                             u.\`email\`,
                                             u.\`is_admin\`,
                                             u.\`premium_expire\`,
                                             (u.\`premium_expire\` is not null AND u.\`premium_expire\` > NOW()) is_premium,
                                             (u.\`last_active\` IS NOT NULL AND
                                              u.\`last_active\` >= DATE_SUB(NOW(), INTERVAL ? second))           is_online,
                                             u.\`last_active\`,
                                             # ROW_NUMBER() OVER (ORDER BY score)                              place_num,
                                             5                                                                   place_num,
                                             u.score                                                             score
                                      from \`users\` u
                                      where u.\`id\` = ?`, [5 * 60, user_id]))[0];
    if (!user_page) {
        error_msg = "Пользователь не найден";
    } else {
        user_page.avatar = `/images/${user_page.ava_file_id}`;
        user_page.is_online = user_page.is_online === 1;
        user_page.is_admin = user_page.is_admin === 1;
        user_page.is_premium = user_page.is_premium === 1;

        langs = await db.rquery(`SELECT g.id,
                                        g.title,
                                        g.background,
                                        g.avatar,
                                        IF(RAND() < 0.2, 1, RAND()) as progress
                                 from langs g
                                 order by progress desc`);
        langs.forEach(v => {
            v.avatar = `/images/${v.avatar}`;
            v.url = `/courses/${v.id}`;
        });
    }
    res.render(path.join(__dirname, "user", "index.pug"), {
        basedir: path.join(__dirname, "user"),
        current_page: "user",
        current_url: req.url,
        // error_settings_msg: Math.random() < 0.3 ? "Тест ошибки" : undefined,
        error_settings_msg: undefined,
        error_msg,
        langs,
        user: req.user,
        user_page: user_page,
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

async function Route_Notifications(app, db, req, res) {
    if (!req.user || !req.user.is_authorised) {
        res.redirect(url.format({
            pathname: "/login",
            query: {"redirect": `/notifications`}
        }));
        return;
    }

    let notifications = await db.rquery(`select id,
                                                user_id,
                                                title,
                                                create_time,
                                                text,
                                                action_url,
                                                is_read,
                                                auto_read
                                         from notifications
                                         where user_id = ?
                                         order by create_time desc
                                         limit 100`, [req.user.user_id]);

    res.render(path.join(__dirname, "notifications", "index.pug"), {
        basedir: path.join(__dirname, "notifications"),
        current_page: "notifications",
        current_url: req.url,
        notifications,
        user: req.user
    }, (err, page) => HandleResult(err, page, res));

    await db.rquery(`update notifications
                     set is_read = true
                     where id in ?`, [[notifications.filter(v => v.auto_read === 1).map(v => v.id)]]);
}

async function PushNotification(db, user_id, title, text, action_url = null, auto_read = true) {
    await db.rquery(`insert into notifications(user_id, title, create_time, text, action_url, is_read, auto_read)
                     VALUES (?, ?, NOW(), ?, ?, false, ?)`, [user_id, title, text, action_url, auto_read]);
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
        await Route_Error(res, 418, "Ну чё, сломал?", err.message);
    } else
        res.end(page);
}
