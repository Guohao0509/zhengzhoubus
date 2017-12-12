var express = require('express');
var session = require('express-session');
var compression = require('compression');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var api = require('./routes/api-filter');
var auth = require('./routes/auth-filter');
//var users = require('./routes/users');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(compression());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'bugu_bus_secret',
  name: 'testapp',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
  cookie: {maxAge: 3600*1000 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
  resave: true,
  saveUninitialized: true,
  rolling: true
}));
//设置浏览器缓存
app.use(express.static(path.join(__dirname, 'public'),[{
  dotfiles: 'ignore',
  etag: false,
  extensions: ['css','png','gif','jpg','js'],
  index: true,
  maxAge: '3600000',
  redirect: true,
  setHeaders: function (res, path, stat) {
    //res.set('x-timestamp', Date.now());
    res.setHeader("Cache-Control","Expires");
  }
}]));
//过滤掉前缀是api的服务接口
app.use('/spa/api', api);
app.use('/spa/auth',auth);
app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
module.exports = app;
