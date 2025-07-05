import express from 'express';
import mysql from 'mysql2';
import { Request, Response } from 'express';
import logger from './logger';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// 创建数据库连接池
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'test'
});

// 测试连接
db.getConnection((err, connection) => {
  if (err) {
    logger.error('数据库连接失败', { error: err.message });
  } else {
    logger.info('成功连接数据库 ✅');
    connection.release();
  }
});

app.get('/users', (req: Request, res: Response) => {
  logger.info('查询用户列表请求', { ip: req.ip, userAgent: req.get('User-Agent') });
  
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      logger.error('查询用户列表失败', { error: err.message, ip: req.ip });
      return res.status(500).send(err.message);
    }
    
    logger.info('查询用户列表成功', { count: Array.isArray(results) ? results.length : 0 });
    res.json(results);
  });
});

app.get('/add-user', (req: Request, res: Response) => {
  const name = 'Alice' + Math.floor(Math.random() * 1000); // 随机生成用户名
  const address = 'Address' + Math.floor(Math.random() * 1000); // 随机生成地址
  
  logger.info('创建用户请求', { name, address, ip: req.ip, userAgent: req.get('User-Agent') });
  
  const sql = 'INSERT INTO users (name, address) VALUES (?, ?)';
  db.query(sql, [name, address], (err, result) => {
    if (err) {
      logger.error('创建用户失败', { error: err.message, name, address, ip: req.ip });
      return res.status(500).send(err.message);
    }
    
    // @ts-ignore
    const userId = result.insertId;
    logger.info('创建用户成功', { userId, name, address });
    res.send(`插入用户，ID: ${userId}, 姓名: ${name}, 地址: ${address}`);
  });
});

app.listen(port, '0.0.0.0', () => {
  logger.info(`服务启动成功：http://0.0.0.0:${port}`, { port, env: process.env.NODE_ENV || 'development' });
});
