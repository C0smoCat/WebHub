"use strict";

module.exports = {
    databaseConfig: {
        connectionLimit: 5,
        host: "n2o93bb1bwmn0zle.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
        user: "hdb6p9d3z3obyszl",
        database: "ykik5i6tm9tdzbb1",
        password: "vdpmm0t5f9g4f9ao",
        port: 3306,
        charset: "UTF8_GENERAL_CI",
        debug: false
    },
    port: 8080,
    debug_mode: process.env.NODE_ENV !== 'production' || typeof v8debug === 'object' || /--debug|--inspect/.test(process.execArgv.join(' ') || process.env.NODE_OPTIONS.includes("debug"))
};
