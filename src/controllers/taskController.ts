import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';

export class TaskController {
  /**
   * 创建任务
   */
  static createTask = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: '任务名称不能为空' });
      }

      const task = await TaskService.createTask(name, req.user.userId);

      res.status(201).json({
        message: '任务创建成功',
        data: task
      });
    } catch (error) {
      console.error('创建任务错误:', error);
      res.status(500).json({ message: '创建任务失败' });
    }
  };

  /**
   * 获取用户任务列表
   */
  static getUserTasks = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { tasks, total } = await TaskService.getUserTasks(req.user.userId, page, limit);

      res.json({
        message: '获取任务列表成功',
        data: {
          tasks,
          pagination: {
            current: page,
            size: limit,
            total
          }
        }
      });
    } catch (error) {
      console.error('获取任务列表错误:', error);
      res.status(500).json({ message: '获取任务列表失败' });
    }
  };

  /**
   * 重命名任务
   */
  static renameTask = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const taskId = parseInt(req.params.id);
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: '任务名称不能为空' });
      }

      const task = await TaskService.renameTask(taskId, req.user.userId, name);

      res.json({
        message: '重命名任务成功',
        data: task
      });
    } catch (error) {
      console.error('重命名任务错误:', error);
      res.status(500).json({ message: '重命名任务失败' });
    }
  };

  /**
   * 删除任务
   */
  static deleteTask = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const taskId = parseInt(req.params.id);
      await TaskService.deleteTask(taskId, req.user.userId);

      res.json({
        message: '删除任务成功'
      });
    } catch (error) {
      console.error('删除任务错误:', error);
      res.status(500).json({ message: '删除任务失败' });
    }
  };
} 