import { Request, Response } from 'express';
import UserService from '../services/userService';
import logger from '../utils/logger';
import { generateToken } from '../utils/auth';
import { LoginResponse } from '../types/user';

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

  // 用户注册
  static async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // 验证请求数据
      if (!username || !password) {
        res.status(400).json({ 
          error: '用户名和密码不能为空' 
        });
        return;
      }

      // 验证用户名长度
      if (username.length < 3 || username.length > 50) {
        res.status(400).json({ 
          error: '用户名长度必须在3-50个字符之间' 
        });
        return;
      }

      // 验证密码强度
      if (password.length < 6) {
        res.status(400).json({ 
          error: '密码长度至少6个字符' 
        });
        return;
      }

      logger.info('用户注册请求', { 
        username, 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });

      const result = await UserService.registerUser({ username, password });
      
      res.status(201).json({
        message: '用户注册成功',
        userId: result.insertId,
        username
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logger.error('用户注册失败', { 
        error: errorMessage, 
        ip: req.ip 
      });
      
      if (errorMessage === '用户名已存在') {
        res.status(409).json({ error: errorMessage });
      } else {
        res.status(500).json({ error: '服务器内部错误' });
      }
    }
  }

  // 用户登录
  static async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // 验证请求数据
      if (!username || !password) {
        res.status(400).json({ 
          error: '用户名和密码不能为空' 
        });
        return;
      }

      logger.info('用户登录请求', { 
        username, 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });

      const user = await UserService.loginUser({ username, password });
      
      if (!user) {
        res.status(401).json({
          error: '用户名或密码错误'
        });
        return;
      }

      // 生成JWT Token
      const token = generateToken(user.id!, user.username);

      const response: LoginResponse = {
        message: '登录成功',
        token,
        user: {
          id: user.id!,
          username: user.username
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      logger.error('用户登录失败', { 
        error: errorMessage, 
        ip: req.ip 
      });
      
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
}

export default UserController;