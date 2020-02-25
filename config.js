"use strict";

module.exports = {
    databaseConfig: {
        connectionLimit: 5,
        host: "localhost",
        user: "root",
        database: "webhub",
        password: "",
        port: 3306,
        charset: "UTF8_GENERAL_CI",
        debug: false
    },
    port: 8080,
    debug_mode: process.env.NODE_ENV !== 'production' || typeof v8debug === 'object' || /--debug|--inspect/.test(process.execArgv.join(' ') || process.env.NODE_OPTIONS.includes("debug"))
};