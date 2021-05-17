require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

// called as cb once user id found/created in DB
passport.serializeUser(function (user, done) {
    // Just pass the ID to make the cookie smaller
    done(null, user.id);
});

// When a user tries to access an authenticated route, passport-session will take the cookie and call this
passport.deserializeUser(async function (id, done) {
    // take the id and find the user in the DB using the (google) id off the cookie
    const user = await pool.query(
        `
            SELECT id, display_name
            FROM users
            WHERE id = $1
        `,
        [id]
    );

    done(null, user.rows[0]);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3001/auth/google/callback',
        },

        // Triggered once user logs in
        async function (accessToken, refreshToken, profile, cb) {
            try {
                await pool.query(
                    `
                        INSERT INTO users (display_name, google_id)
                        VALUES ($1, $2)
                        ON CONFLICT (google_id)
                        DO NOTHING
                    `,
                    [profile.displayName, profile.id.toString()]
                );
    
                const requestedUser = await pool.query(
                    `
                        SELECT id, display_name
                        FROM users
                        WHERE google_id = $1
                    
                    `,
                    [profile.id.toString()]
                );
    
                const user = requestedUser.rows[0];
    
                return cb(null, user);

            } catch (error) {
                console.log(error.message);
            }
            
        }
    )
);
