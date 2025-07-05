// 文章表操作模块
const pool = require('./config');

/**
 * 获取所有文章
 * @param {number} page 页码
 * @param {number} limit 每页数量
 * @returns {Promise<Array>} 文章列表
 */
async function getAllPosts(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.execute(
    `SELECT *
    FROM
      wp_posts
    ORDER BY
      post_date DESC
    LIMIT
      ${offset}, ${limit}`
  );
  return rows;
}

/**
 * 根据ID获取文章
 * @param {number} id 文章ID
 * @returns {Promise<Object>} 文章信息
 */
async function getPostById(id) {
  const [rows] = await pool.execute(
    `SELECT *
    FROM
      wp_posts
    WHERE
      ID = ${id}`
  );
  return rows[0];
}

/**
 * 根据作者ID获取文章
 * @param {number} authorId 作者ID
 * @returns {Promise<Array>} 文章列表
 */
async function getPostsByAuthor(authorId) {
  const [rows] = await pool.execute(
    `SELECT *
    FROM
      wp_posts
    WHERE
      post_author = ${authorId}
    ORDER BY
      post_date DESC`
  );
  return rows;
}

/**
 * 创建新文章
 * @param {Object} post 文章信息
 * @returns {Promise<Object>} 新创建的文章
 */
async function createPost(post) {
  const {
    post_author,
    post_title,
    post_content,
    post_status = 'publish',
    post_type = 'post'
  } = post;
  const sql = `INSERT INTO wp_posts
      (post_author, post_title, post_content, post_status, post_type, post_date, post_date_gmt)
    VALUES
      (${post_author}, '${post_title}', '${post_content}', '${post_status}', '${post_type}', NOW(), NOW())`;
  console.log('createPost-sql', sql);
  const [result] = await pool.execute(sql).catch((err) => {
    console.log('createPost-err', err);
  });
  return getPostById(result.insertId);
}

/**
 * 更新文章信息
 * @param {number} id 文章ID
 * @param {Object} post 文章信息
 * @returns {Promise<Object>} 更新后的文章
 */
async function updatePost(id, post) {
  const fields = [];
  const values = [];

  if (post.post_title) {
    fields.push('post_title = ?');
    values.push(post.post_title);
  }
  if (post.post_content) {
    fields.push('post_content = ?');
    values.push(post.post_content);
  }
  if (post.post_status) {
    fields.push('post_status = ?');
    values.push(post.post_status);
  }
  if (post.post_type) {
    fields.push('post_type = ?');
    values.push(post.post_type);
  }

  if (fields.length === 0) return getPostById(id);

  values.push(id);
  // 将values数组中的值拼接到SQL字符串中
  const sql = `UPDATE wp_posts SET ${fields.join(
    ', '
  )}, post_modified = NOW(), post_modified_gmt = NOW() WHERE ID = ${values.pop()}`;
  await pool.execute(sql);
  return getPostById(id);
}

/**
 * 删除文章
 * @param {number} id 文章ID
 * @returns {Promise<boolean>} 删除结果
 */
async function deletePost(id) {
  // 实际应用中可能需要软删除，这里实现硬删除
  const [result] = await pool.execute(
    `DELETE FROM
      wp_posts
    WHERE
      ID = ${id}`
  );
  return result.affectedRows > 0;
}

module.exports = {
  getAllPosts,
  getPostById,
  getPostsByAuthor,
  createPost,
  updatePost,
  deletePost
};
