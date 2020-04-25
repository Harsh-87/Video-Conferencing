var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.verifyUser = (req,res,next)=>{
    if (req.isAuthenticated()) {
        next();
    }else{
        res.redirect("/user/login");
    }
};