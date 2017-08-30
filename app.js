var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cors = require('cors');
var wildcardSubdomains = require('wildcard-subdomains');
var prerender = require('prerender-node');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();

const corsOptions = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}

const opts = {
  namespace: '_wildcard_.joboapptest',
  whitelist: ['www', 'blog'],
};

app.use(cors(corsOptions));
app.use(wildcardSubdomains(opts));
// view engine setup
app.set('views', path.join(__dirname, 'dist'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// const prerenderServiceUrl = 'https://jobotestprerender.herokuapp.com';
const prerenderServiceUrl = 'http://localhost:55565';
app.use(prerender.set('prerenderServiceUrl', prerenderServiceUrl ));

// app.get('/view/store/:storeId', routes.stores);
app.get('/templates/:name', routes.templates);
app.get('/employer/:name', routes.employer);
app.get('/jobseeker/:name', routes.jobseeker);
app.use('/_wildcard_/*/', (req, res, next) => {
  const storeId = req.baseUrl.replace(/(\/)|(_wildcard_)/g, '');
  res.redirect(`/view/store/${storeId}?job=server`);
});
app.use('*', routes.index);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
