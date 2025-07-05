function customMerge(obj1, obj2) {
  const result = {};
  // 遍历第一个对象的所有属性
  Object.keys(obj1).forEach((key) => {
    // 如果第二个对象有同名属性，则取第二个对象的值；否则保留第一个对象的值
    result[key] = obj2.hasOwnProperty(key) ? obj2[key] : obj1[key];
  });
  return result;
}

module.exports = {
  customMerge
}