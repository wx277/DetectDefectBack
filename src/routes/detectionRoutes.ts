import { Router } from 'express';
import { checkAuth } from '../middlewares/auth';
import { DetectionController } from '../controllers/detectionController';

const router = Router();

// 执行缺陷检测
router.post('/:imageId/analyze', checkAuth, DetectionController.analyze);

// 获取检测结果
router.get('/:imageId/results', checkAuth, DetectionController.getResults);

// 获取检测统计信息
router.get('/stats', checkAuth, DetectionController.getStats);

export default router; 