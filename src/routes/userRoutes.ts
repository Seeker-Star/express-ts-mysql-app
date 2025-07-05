import { Router } from 'express';
import UserController from '../controllers/userController';

const router = Router();

// 用户相关路由
router.get('/users', UserController.getUsers);
router.get('/add-user', UserController.addUser);

export default router;