import { Router } from 'express';
import { checkAuth } from '../middlewares/auth';
import { AdminController } from '../controllers/adminController';

const router = Router();

// 获取用户列表（支持搜索）
router.get('/users', checkAuth, AdminController.getAllUsers);

// 获取用户详情
router.get('/users/:id', checkAuth, AdminController.getUserDetail);

// 更新用户信息
router.patch('/users/:id', checkAuth, AdminController.updateUser);

// 删除单个用户
router.delete('/users/:id', checkAuth, AdminController.deleteUser);

// 批量删除用户
router.post('/users/batch-delete', checkAuth, AdminController.deleteUsers);

export default router; 