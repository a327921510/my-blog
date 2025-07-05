// 数据库配置文件
const mysql = require('mysql2/promise');

// 从环境变量或配置文件中读取数据库连接信息
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root', // 请填写实际数据库密码，如果本地MySQL没有密码可留空
  database: 'wordpress_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建数据库连接池
const pool = mysql.createPool(config);

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
}

testConnection();

module.exports = pool;