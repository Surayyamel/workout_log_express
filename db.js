const Pool = require('pg').Pool;
require('dotenv').config();

let pool;
if (process.env.NODE_ENV === 'development') {
    pool = new Pool({
        user: 'surayyafenton',
        password: process.env.DB_PASSWORD,
        host: 'localhost',
        port: 5432,
        database: 'workout',
    });
} else if (process.env.NODE_ENV === 'test') {
    pool = new Pool({
        user: 'surayyafenton',
        password: process.env.DB_PASSWORD,
        host: 'localhost',
        port: 2345,
        database: 'workout_test',
    });
} else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
}

module.exports = pool;
