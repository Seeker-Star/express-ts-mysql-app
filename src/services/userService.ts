import { User, UserQueryResult, DatabaseResult } from '../types/user';
import db from '../config/database';
import logger from '../utils/logger';

export class UserService {
  // 获取所有用户
  static async getAllUsers(): Promise<UserQueryResult[]> {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users', (err, results) => {
        if (err) {
          logger.error('查询用户列表失败', { error: err.message });
          reject(err);
        } else {
          logger.info('查询用户列表成功', { 
            count: Array.isArray(results) ? results.length : 0 
          });
          resolve(results as UserQueryResult[]);
        }
      });
    });
  }

  // 创建用户
  static async createUser(user: User): Promise<DatabaseResult> {
    return new Promise((resolve, reject) => {
      const { name, address } = user;
      const sql = 'INSERT INTO users (name, address) VALUES (?, ?)';
      
      db.query(sql, [name, address], (err, result) => {
        if (err) {
          logger.error('创建用户失败', { error: err.message, name, address });
          reject(err);
        } else {
          const dbResult = result as DatabaseResult;
          logger.info('创建用户成功', { 
            userId: dbResult.insertId, 
            name, 
            address 
          });
          resolve(dbResult);
        }
      });
    });
  }

  // 生成随机用户数据
  static generateRandomUser(): User {
    const name = 'Alice' + Math.floor(Math.random() * 1000);
    const address = 'Address' + Math.floor(Math.random() * 1000);
    return { name, address };
  }
}

export default UserService;