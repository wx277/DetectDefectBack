import { getRepository } from 'typeorm';
import { Task } from '../models/Task';
import { Image } from '../models/Image';

export class TaskService {
  /**
   * 创建新任务
   */
  static async createTask(name: string, userId: number): Promise<Task> {
    const taskRepository = getRepository(Task);
    
    const task = new Task();
    task.name = name;
    task.user_id = userId;
    
    return await taskRepository.save(task);
  }

  /**
   * 获取用户的所有任务
   */
  static async getUserTasks(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ tasks: Task[]; total: number }> {
    const taskRepository = getRepository(Task);
    
    const [tasks, total] = await taskRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['images'] // 加载关联的图片
    });

    return { tasks, total };
  }

  /**
   * 重命名任务
   */
  static async renameTask(taskId: number, userId: number, newName: string): Promise<Task> {
    const taskRepository = getRepository(Task);
    
    const task = await taskRepository.findOne({
      where: { id: taskId, user_id: userId }
    });

    if (!task) {
      throw new Error('任务不存在或无权访问');
    }

    task.name = newName;
    return await taskRepository.save(task);
  }

  /**
   * 删除任务
   */
  static async deleteTask(taskId: number, userId: number): Promise<boolean> {
    const taskRepository = getRepository(Task);
    const imageRepository = getRepository(Image);

    const task = await taskRepository.findOne({
      where: { id: taskId, user_id: userId }
    });

    if (!task) {
      throw new Error('任务不存在或无权访问');
    }

    // 先删除关联的图片
    await imageRepository.delete({ task_id: taskId });
    
    // 再删除任务
    await taskRepository.remove(task);
    return true;
  }

  /**
   * 更新任务状态
   */
  static async updateTaskStatus(taskId: number, userId: number, status: string): Promise<Task> {
    const taskRepository = getRepository(Task);
    
    const task = await taskRepository.findOne({
      where: { id: taskId, user_id: userId }
    });

    if (!task) {
      throw new Error('任务不存在或无权访问');
    }

    task.status = status;
    return await taskRepository.save(task);
  }
} 