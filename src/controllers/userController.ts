import { Request, Response } from 'express';
import UserService from '../services/userService';
import logger from '../utils/logger';

export class UserController {
  // 获取用户列表
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      logger.info('查询用户列表请求', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });

      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logger.error('查询用户列表失败', { 
        error: errorMessage, 
        ip: req.ip 
      });
      res.status(500).send(errorMessage);
    }
  }

  // 添加用户
  static async addUser(req: Request, res: Response): Promise<void> {
    try {
      const user = UserService.generateRandomUser();
      
      logger.info('创建用户请求', { 
        name: user.name, 
        address: user.address, 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });

      const result = await UserService.createUser(user);
      res.send(`插入用户，ID: ${result.insertId}, 姓名: ${user.name}, 地址: ${user.address}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logger.error('创建用户失败', { 
        error: errorMessage, 
        ip: req.ip 
      });
      res.status(500).send(errorMessage);
    }
  }
}

export default UserController;