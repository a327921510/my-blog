const { expressjwt } = require('express-jwt');
const jwtSecret = 'your_jwt_secret_key'; // 应与登录接口中使用的密钥保持一致

const whiteList = ['/api/login', '/api/users'];
// 内存存储已颁发的tokens
const activeTokens = new Set();

// JWT验证中间件
const authMiddleware = expressjwt({
  secret: jwtSecret,
  algorithms: ['HS256'],
  credentialsRequired: true
}).unless({
  // 不需要验证的路径
  path: whiteList
});

// 验证token是否在活跃列表中
const verifyActiveToken = (req, res, next) => {
  console.log('verifyActiveToken', req.path);
  if (whiteList.includes(req.path)) {
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !activeTokens.has(token)) {
    return res.customJson(401, 1, null, '身份验证失败或token已过期');
  }

  next();
};

module.exports = {
  activeTokens,
  authMiddleware,
  verifyActiveToken
};
