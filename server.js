/**
 * Author: Harsh KOthari
 * Version: 1.0.0
 */
'use strict';

const express = require("express");
const app = express();
var bodyParser = require('body-parser');
var http = require("http").Server(app);
var mongoose = require('mongoose');
var auth = require('./authenticate');
var passport = require('passport');
var session = require('express-session');
var socketController = require('./controllers/socketController.js');
const config = require('./appConfig.js');
var userRouter = require('./routes/userRouter');
var homeRouter = require('./routes/homeRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views',__dirname+'/views');

// Setting up DB using mongoose
const url = config.DBURL;
const connect = mongoose.connect(url,{ useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
connect.then((db) => {
    console.log("Database connected correctly to server");
}, (err) => { console.log(err); });

//passport athentication using local strategy
app.use(session({
    secret: "Littlesecret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//making public folder static to use resources
app.use('/public', express.static('public'));

// Mounting subapps
app.use('/user', userRouter);
app.use('/', homeRouter);

//setup sockets
var io = require('socket.io')(http);
socketController(io);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send(err);
});

var port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log('listening on :' + port);
});