import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// 请求日志中间件
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // 记录请求开始
  logger.info('请求开始', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('请求完成', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });

  next();
};