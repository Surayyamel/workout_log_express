require('dotenv').config();
const { Pool, Client } = require('pg');
const app = require('./index');
const passport = require('passport');
const db = require('./db');

const Strategy = require('passport-google-oauth20').Strategy;
const originURL = process.env.ORIGIN_URL;

// Called as cb once user id found/created in DB
passport.serializeUser(function (user, done) {
    // Just pass the ID to make the cookie smaller
    done(null, user.id);
});

// When a user tries to access an authenticated route, passport-session will take the cookie and call this
passport.deserializeUser(async function (id, done) {
    // take the id and find the user in the DB using the (google) id off the cookie
    try {
        const client = new Client(db);
        client.connect();

        const user = await client.query(
            `
                SELECT id, display_name
                FROM users
                WHERE id = $1
            `,
            [id]
        );

        client.end();
        done(null, user.rows[0]);
    } catch (error) {
        console.error(error);
    }
});

passport.use(
    new Strategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${originURL}/auth/google/callback`,
        },

        // Triggered once user logs in
        async function (accessToken, refreshToken, profile, cb) {
            try {
                const client = new Client(db);
                client.connect();

                // Find or create user
                await client.query(
                    `
                        INSERT INTO users (display_name, google_id)
                        VALUES ($1, $2)
                        ON CONFLICT (google_id)
                        DO NOTHING
                    `,
                    [profile.displayName, profile.id.toString()]
                );

                const requestedUser = await client.query(
                    `
                        SELECT id, display_name
                        FROM users
                        WHERE google_id = $1
                    
                    `,
                    [profile.id.toString()]
                );

                const user = requestedUser.rows[0];

                client.end();
                return cb(null, user);
            } catch (error) {
                console.error(error);
            }
        }
    )
);
