const router = require('express').Router();
const passport = require('passport');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});

router.get('/failed', (req, res) => {
    res.send('You failed to log in');
});

router.get(
    '/auth/google', authLimiter, 
    passport.authenticate('google', { scope: ['profile'] })
);
 
router.get(
    '/auth/google/callback', authLimiter, 
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