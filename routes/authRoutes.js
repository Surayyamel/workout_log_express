const router = require('express').Router();
const passport = require('passport');

const origin = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://sf-workout-log.herokuapp.com';

router.get('/failed', (req, res) => {
    res.send('You failed to log in');
});

router.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
);
 
router.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/failed' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect(origin);
    }
);

router.get('/logout', (req, res) => {
    console.log('logging out')
    req.session = null;
    req.logout();
    res.redirect(origin);
});

router.get('/loggedin', (req, res) => {
    if (req.user) {
        res.json(true);
    } else {
        res.json(false);
    }
});


module.exports = router;