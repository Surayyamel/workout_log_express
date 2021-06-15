const express = require('express');
const cors = require('cors');
const passport = require('passport');
const cookieSession = require('cookie-session');
const authRoutes = require('./routes/authRoutes');
const { crudRoutes } = require('./routes/crudRoutes');
// Passport config
require('./passport');

const app = express();

const origin = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://sf-workout-log.herokuapp.com';

app.set("trust proxy", 1);

app.use(
    cookieSession({
        name: 'sf-workout-log-session',
        maxAge: 24 * 60 * 60 * 1000,
        keys: ['randomstring'],
        secure: true,
        sameSite: 'none',
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(
    cors({
        credentials: true,
        origin: origin,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    }),
    express.json()
);

app.use(authRoutes);
app.use(crudRoutes);

module.exports = app;
