import mysql from 'mysql2';
import logger from '../utils/logger';

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'test'
};

// 创建数据库连接池
export const db = mysql.createPool(dbConfig);

// 测试数据库连接
export const testConnection = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) {
        logger.error('数据库连接失败', { error: err.message });
        reject(err);
      } else {
        logger.info('成功连接数据库 ✅');
        connection.release();
        resolve();
      }
    });
  });
};

export default db;