const { snakeCase } = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { activeTokens } = require('../middleware/auth');
// JWT配置
const jwtSecret = 'your_jwt_secret_key'; // 实际应用中应使用环境变量
const tokenExpiry = '1h';

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
        // 生成JWT令牌
        const token = jwt.sign(
          { userId: user.id, username: user.username },
          jwtSecret,
          { algorithm: 'HS256', expiresIn: tokenExpiry }
        );

        // 存储令牌
        activeTokens.add(token);

        res.customJson(
          200,
          0,
          { token, user: { id: user.id, username: user.username } },
          '登录成功'
        );
      } else {
        res.customJson(200, 1, null, '输入的账号或密码错误');
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  // 删除用户
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      console.log('userId', userId);
      const result = await db.users.deleteUser(userId);
      if (result.affectedRows === 1) {
        res.customJson(200, 0, null, '用户删除成功');
      } else {
        res.customJson(200, 1, null, '用户不存在或删除失败');
      }
    } catch (error) {
      console.log('delete - /api/users/:id', error);
      res.status(500).json({ error: error.message });
    }
  });
};
