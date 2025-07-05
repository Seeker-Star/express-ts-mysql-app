import { Router } from 'express';
import userRoutes from './userRoutes';

const router = Router();

// 注册所有路由
router.use('/', userRoutes);

// 健康检查路由
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;