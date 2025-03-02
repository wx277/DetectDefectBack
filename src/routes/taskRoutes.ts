import { Router } from 'express';
import { checkAuth } from '../middlewares/auth';
import { TaskController } from '../controllers/taskController';

const router = Router();

// 创建任务
router.post('/', checkAuth, TaskController.createTask);

// 获取任务列表
router.get('/', checkAuth, TaskController.getUserTasks);

// 重命名任务
router.patch('/:id/rename', checkAuth, TaskController.renameTask);

// 删除任务
router.delete('/:id', checkAuth, TaskController.deleteTask);

export default router; 