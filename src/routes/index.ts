import { Router } from 'express';
import authRoutes from './authRoutes';
import imageRoutes from './imageRoutes';
import detectionRoutes from './detectionRoutes';
import reportRoutes from './reportRoutes';
import taskRoutes from './taskRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// 用户相关路由
router.use('/auth', authRoutes);

// 图像处理相关路由
router.use('/images', imageRoutes);

// 缺陷检测相关路由
router.use('/detection', detectionRoutes);

// 报表相关路由
router.use('/reports', reportRoutes);

// 任务相关路由
router.use('/tasks', taskRoutes);

// 管理员相关路由
router.use('/admin', adminRoutes);

export default router; 