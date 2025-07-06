import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { JWTPayload } from '../types/user';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logger.warn('JWT认证失败：缺少Token', { 
        ip: req.ip, 
        path: req.path 
      });
      res.status(401).json({ error: '访问被拒绝，需要认证Token' });
      return;
    }

    const decoded = verifyToken(token) as JWTPayload;
    req.user = decoded;
    
    logger.info('JWT认证成功', { 
      userId: decoded.userId, 
      username: decoded.username,
      ip: req.ip,
      path: req.path
    });

    next();
  } catch (error) {
    logger.warn('JWT认证失败：Token无效', { 
      error: error instanceof Error ? error.message : '未知错误',
      ip: req.ip, 
      path: req.path 
    });
    res.status(403).json({ error: '无效的认证Token' });
  }
};

export default authenticateToken;