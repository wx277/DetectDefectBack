import { Router } from 'express';
import { checkAuth } from '../middlewares/auth';

const router = Router();

// TODO: 实现报表相关的具体路由处理器
router.get('/daily', checkAuth, (req, res) => {
  // 实现日报表
});

router.get('/monthly', checkAuth, (req, res) => {
  // 实现月报表
});

export default router; 