const Pool = require('pg').Pool;
require('dotenv').config()


const pool = new Pool({
    user: 'surayyafenton',
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    port: 5432,
    database: 'workout_test'
});

module.exports = pool;