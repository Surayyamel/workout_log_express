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
        res.redirect('http://localhost:3000');
    }
);

router.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('http://localhost:3000');
});

router.get('/loggedin', (req, res) => {
    if (req.user) {
        res.json(true);
    } else {
        res.json(false);
    }
});


module.exports = router;