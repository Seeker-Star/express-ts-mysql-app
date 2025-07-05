import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// 全局错误处理中间件
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('未处理的错误', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};

// 404处理中间件
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('404 - 路由未找到', {
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    message: '请求的资源未找到',
    path: req.url
  });
};