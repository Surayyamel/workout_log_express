const express = require('express');
const cors = require('cors');
const passport = require('passport');
const cookieSession = require('cookie-session');
const authRoutes = require('./routes/authRoutes');
const crudRoutes = require('./routes/crudRoutes');
// Passport config
require('./passport');

const app = express();

app.use(
    cookieSession({
        name: 'workout-log-session',
        maxAge: 24 * 60 * 60 * 1000,
        keys: ['randomstring'],
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(
    cors({ credentials: true, origin: 'http://localhost:3000' }),
    express.json()
);

app.use(authRoutes);
app.use(crudRoutes);


app.listen(3001, () => {
    console.log('server up on port 3001');
});
