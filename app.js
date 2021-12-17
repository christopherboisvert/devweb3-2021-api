'use strict';
var debug = require('debug')('my express app');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dotenv = require("dotenv");
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');

var routes = require('./routes/index');
var actions = require('./routes/actions');
var portfolios = require('./routes/portfolios');
var utilisateurs = require('./routes/utilisateurs');
var connexion = require('./routes/connexion');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// dotenv setup
dotenv.config();

//CORS
app.use(cors())

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/actions', actions);
app.use('/portfolios', portfolios);
app.use('/utilisateurs', utilisateurs);
app.use('/connexion', connexion);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (process.env.EN_PRODUCTION === true) {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
