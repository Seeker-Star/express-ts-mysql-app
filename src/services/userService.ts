import { User, UserQueryResult, DatabaseResult, AuthUser, RegisterUserRequest } from '../types/user';
import db from '../config/database';
import logger from '../utils/logger';
import { hashPassword } from '../utils/auth';

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

  // 检查用户名是否已存在
  static async checkUsernameExists(username: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id FROM auth_users WHERE username = ?';
      
      db.query(sql, [username], (err, results) => {
        if (err) {
          logger.error('检查用户名失败', { error: err.message, username });
          reject(err);
        } else {
          const exists = Array.isArray(results) && results.length > 0;
          resolve(exists);
        }
      });
    });
  }

  // 注册新用户
  static async registerUser(userData: RegisterUserRequest): Promise<DatabaseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const { username, password } = userData;
        
        // 检查用户名是否已存在
        const usernameExists = await this.checkUsernameExists(username);
        if (usernameExists) {
          const error = new Error('用户名已存在');
          logger.warn('用户注册失败：用户名已存在', { username });
          reject(error);
          return;
        }

        // 哈希密码
        const hashedPassword = await hashPassword(password);
        
        // 插入新用户
        const sql = 'INSERT INTO auth_users (username, password) VALUES (?, ?)';
        
        db.query(sql, [username, hashedPassword], (err, result) => {
          if (err) {
            logger.error('注册用户失败', { error: err.message, username });
            reject(err);
          } else {
            const dbResult = result as DatabaseResult;
            logger.info('用户注册成功', { 
              userId: dbResult.insertId, 
              username 
            });
            resolve(dbResult);
          }
        });
      } catch (error) {
        logger.error('注册用户过程中发生错误', { error: error instanceof Error ? error.message : '未知错误', username: userData.username });
        reject(error);
      }
    });
  }
}

export default UserService;