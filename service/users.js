const { snakeCase } = require('lodash');
const bcrypt = require('bcrypt');
const { expressjwt: jwt } = require('express-jwt');
// 导入数据库操作模块
const db = {
  users: require('../db/users')
};

module.exports = async (app) => {
  // 注册
  app.post('/api/users', async (req, res) => {
    try {
      req.body.userPass = await bcrypt.hash(req.body.userPass, 10);
      req.body = Object.fromEntries(
        Object.entries(req.body).map(([key, value]) => {
          return [snakeCase(key), value];
        })
      );
      const user = await db.users.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.log('/api/users', error);
      res.status(500).json({ error: error.message });
    }
  });
  // 登录
  app.post('/api/login', async (req, res) => {
    try {
      const user = await db.users.getUserByName(req.body.username);
      console.log('/api/login', user);
      if (typeof user !== 'object' || user === null) {
        res.status(201).json({
          code: 1,
          msg: '输入的账号或密码错误'
        });
      }
      const compareRes = await bcrypt.compare(
        req.body.password,
        user.user_pass
      );
      if (compareRes) {
        res.customJson(200, 0, null, '登录成功');
      } else {
        res.customJson(200, 1, null, '输入的账号或密码错误');
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
