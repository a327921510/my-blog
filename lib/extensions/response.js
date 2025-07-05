// lib/extensions/response.js
module.exports = function (responseProto) {
  responseProto.customJson = function (status, code, data, msg = 'success') {
    return this.status(status)
      .set('X-Response-Type', 'customJson') // 添加可追踪Header
      .type('json')
      .send(
        JSON.stringify({
          code,
          data,
          msg
          // timestamp: Date.now() // 推荐添加时间戳
        })
      );
  };
};
