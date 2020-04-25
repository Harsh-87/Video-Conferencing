var path = require('path');
var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var passport = require('passport');
var authenticate = require('../authenticate');

router.use(bodyParser.json());

router.route('/')
    .get(authenticate.verifyUser, (req, res, next) => {
        res.sendFile(path.resolve("views/home.html"));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        if (req.body.choice == 'create') {
            res.redirect("/home/create");
        }
        else if (req.body.choice == 'join') {
            res.redirect('/home/join');
        }
        else {
            res.send("Invalid Route!!Error Page not found");
        }
    });

router.route('/home/:choice')
    .get(authenticate.verifyUser, (req, res, next) => {
        if (req.params.choice === 'create') {
            res.sendFile(path.resolve("views/broadcast.html"));
        }
        else if (req.params.choice === 'join') {
            res.sendFile(path.resolve("views/index.html"));
        }
        else {
            res.send("Invalid Route!!Error Page not found");
        }
    });

module.exports = router;
