const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const cookieSession = require('cookie-session');
const authRoutes = require('./routes/authRoutes');
const { crudRoutes } = require('./routes/crudRoutes');
// Passport config
require('./passport');

const app = express();

app.use(helmet());

// for Heroku hosting
app.set('trust proxy', 1);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});

app.use(
    cookieSession({
        name: 'sf-workout-log-session',
        maxAge: 24 * 60 * 60 * 1000,
        keys: ['randomstring'],
        // secure: true,
        // sameSite: 'none',
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_URL,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    }),
    express.json()
);

app.use(authRoutes);
app.use(crudRoutes);

module.exports = app;
