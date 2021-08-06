require('dotenv').config();

let db;

if (process.env.DB === 'dev') {
    db = {
        user: 'surayyafenton',
        password: process.env.DB_PASSWORD,
        host: 'localhost',
        port: 5432,
        database: 'workout',
   };
// } else if (process.env.NODE_ENV === 'test') {
//     db = {
//         user: 'surayyafenton',
//         password: process.env.DB_PASSWORD,
//         host: 'localhost',
//         port: 2345,
//         database: 'workout_test',
// };
} else {
    db = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    };
 }

module.exports = db;

// Removed pooling

// if (true) {
//     pool = new Pool({
//         user: 'surayyafenton',
//         password: process.env.DB_PASSWORD,
//         host: 'localhost',
//         port: 5432,
//         database: 'workout',
//     });
// } else if (process.env.NODE_ENV === 'test') {
//     pool = new Pool({
//         user: 'surayyafenton',
//         password: process.env.DB_PASSWORD,
//         host: 'localhost',
//         port: 2345,
//         database: 'workout_test',
//     });
// } else if (process.env.NODE_ENV === 'production') {
//     pool = new Pool({
//         connectionString: process.env.DATABASE_URL,
//         ssl: {
//             rejectUnauthorized: false,
//         },
//     });
// }
