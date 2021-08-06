const router = require('express').Router();
const passport = require('passport');

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
        res.redirect(process.env.FRONTEND_URL);
    }
);

router.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect(process.env.FRONTEND_URL);
});

router.get('/loggedin', (req, res) => {
    if (req.user) {
        res.json("in");
    } else {
        res.json("out");
    }
});


module.exports = router;