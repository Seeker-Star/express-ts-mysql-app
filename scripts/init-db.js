const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'test',
  multipleStatements: true
};

// 创建数据库连接
const connection = mysql.createConnection(dbConfig);

// 读取SQL文件
const sqlFilePath = path.join(__dirname, '../src/config/init-db.sql');
const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

console.log('正在连接数据库...');
console.log(`主机: ${dbConfig.host}`);
console.log(`数据库: ${dbConfig.database}`);

connection.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
  }
  
  console.log('数据库连接成功!');
  
  // 执行SQL脚本
  console.log('正在执行SQL脚本...');
  connection.query(sqlScript, (err, results) => {
    if (err) {
      console.error('SQL执行失败:', err.message);
      process.exit(1);
    }
    
    console.log('SQL脚本执行成功!');
    console.log('auth_users表已创建完成');
    
    // 关闭连接
    connection.end();
    process.exit(0);
  });
});