var path = require('path');
var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');

router.use(bodyParser.json());

router.route('/login')
    .get(function (req, res, next) {
        res.sendFile(path.resolve('views/login.html'));
    })
    .post(passport.authenticate('local'), (req, res, next) => {
        res.redirect("/");
    });

router.route('/register')
    .get((req, res, next) => {
        res.sendFile(path.resolve('views/register.html'));
    })
    .post((req, res, next) => {
        User.register(new User({ username: req.body.username }),
            req.body.password, (err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ err: err });
                }
                else {
                    if (req.body.email)
                        user.email = req.body.email;
                    user.save((err, user) => {
                        if (err) {
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({ err: err });
                            return;
                        }
                        passport.authenticate('local')(req, res, () => {
                            res.redirect('/user/login');
                        });
                    });
                }
            });
    });

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.logOut();
        res.redirect('/user/login');
    }
    else {
        var err = new Error('You are not logged in!');
        err.status = 403;
        next(err);
    }
});

module.exports = router;