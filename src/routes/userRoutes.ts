import { Router } from 'express';
import UserController from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 公开路由（无需认证）
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);

// 受保护的路由（需要JWT认证）
router.get('/users', authenticateToken, UserController.getUsers);
router.get('/add-user', authenticateToken, UserController.addUser);

export default router;