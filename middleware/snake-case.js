const { snakeCase } = require('lodash');

function midSnakeCase(req, res, next) {
  console.log('midSnakeCase', req.body);
  req.body = Object.fromEntries(
    Object.entries(req.body).map(([key, value]) => {
      return [snakeCase(key), value];
    })
  );

  next();
}

module.exports = {
  midSnakeCase
};
