const { join, snakeCase } = require('lodash');
const { customMerge } = require('../utils/base');
// 用户表操作模块
const pool = require('./config');

/**
 * 获取所有用户
 * @returns {Promise<Array>} 用户列表
 */
async function getAllUsers() {
  const [rows] = await pool.execute('SELECT * FROM wp_users');
  return rows;
}

/**
 * 根据ID获取用户
 * @param {number} id 用户ID
 * @returns {Promise<Object>} 用户信息
 */
async function getUserById(id) {
  const [rows] = await pool.execute(`
    SELECT * FROM wp_users WHERE ID = ${id}
  `);
  return rows[0];
}

async function getUserByName(name) {
  const [rows] = await pool.execute(
    `SELECT * FROM wp_users WHERE user_login = ?`,
    [name]
  );
  return rows[0];
}

/**
 * 创建新用户
 * @param {Object} user 用户信息
 * @returns {Promise<Object>} 新创建的用户
 */
async function createUser(user) {
  const param = customMerge(
    {
      user_login: '',
      user_pass: '',
      user_nicename: '',
      user_email: '',
      user_url: '',
      user_registered: '2025-07-04 00:00:00',
      user_activation_key: '',
      user_status: 0,
      display_name: ''
    },
    user
  );
  const keys = Object.keys(param);
  const sql = `
    INSERT INTO wp_users
      (${keys.join(',')})
    VALUES
      (${join(
        keys.map((key) => `'${String(param[key]) || ''}'`),
        ','
      )});
  `;
  // console.log(12, keys, sql, JSON.stringify(param));
  const [result] = await pool.execute(sql);
  return getUserById(result.insertId);
}

/**
 * 更新用户信息
 * @param {number} id 用户ID
 * @param {Object} user 用户信息
 * @returns {Promise<Object>} 更新后的用户
 */
async function updateUser(id, user) {
  const fields = [];
  const values = [];

  if (user.user_login) {
    fields.push('user_login = ?');
    values.push(user.user_login);
  }
  if (user.user_pass) {
    fields.push('user_pass = ?');
    values.push(user.user_pass);
  }
  if (user.user_nicename) {
    fields.push('user_nicename = ?');
    values.push(user.user_nicename);
  }
  if (user.user_email) {
    fields.push('user_email = ?');
    values.push(user.user_email);
  }
  if (user.display_name) {
    fields.push('display_name = ?');
    values.push(user.display_name);
  }

  if (fields.length === 0) return getUserById(id);

  values.push(id);
  await pool.execute(
    `UPDATE wp_users SET ${fields.join(', ')} WHERE ID = ?`,
    values
  );
  return getUserById(id);
}

/**
 * 删除用户
 * @param {number} id 用户ID
 * @returns {Promise<boolean>} 删除结果
 */
async function deleteUser(id) {
  const [result] = await pool.execute('DELETE FROM wp_users WHERE ID = ?', [
    id
  ]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByName,
  createUser,
  updateUser,
  deleteUser
};

