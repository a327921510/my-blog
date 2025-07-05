const path = require('path');
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// 导入JWT验证中间件
const { authMiddleware, verifyActiveToken } = require('./middleware/auth');
const app = express();
// 拓展 express 实例方法
require('./lib/extensions/response')(app.response);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// 应用JWT验证中间件
app.use(authMiddleware);
app.use(verifyActiveToken);
// app.use(midSnakeCase);

// 接口服务
const service = {
  user: require('./service/users')
};

service.user(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log('error', err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.name === 'UnauthorizedError') {
    res.customJson(401, 1, null, 'token失效');
    return;
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
