"use strict";

module.exports = {
    port: 8080,
    debug_mode: process.env.NODE_ENV !== 'production' || typeof v8debug === 'object' || /--debug|--inspect/.test(process.execArgv.join(' ') || process.env.NODE_OPTIONS.includes("debug"))
};
