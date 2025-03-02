import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class AdminController {
  /**
   * 获取所有用户列表
   */
  static getAllUsers = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权限访问' });
      }

      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { users, total } = await UserService.getAllUsers(search, page, limit);

      res.json({
        message: '获取用户列表成功',
        data: {
          users,
          pagination: {
            current: page,
            size: limit,
            total
          }
        }
      });
    } catch (error) {
      console.error('获取用户列表错误:', error);
      res.status(500).json({ message: '获取用户列表失败' });
    }
  };

  /**
   * 更新用户信息
   */
  static updateUser = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权限访问' });
      }

      const userId = parseInt(req.params.id);
      const { username, password, role, status } = req.body;

      const user = await UserService.updateUser(userId, req.user.userId, {
        username,
        password,
        role,
        status
      });

      res.json({
        message: '更新用户信息成功',
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      console.error('更新用户信息错误:', error);
      res.status(500).json({ message: '更新用户信息失败' });
    }
  };

  /**
   * 删除用户
   */
  static deleteUser = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权限访问' });
      }

      const userId = parseInt(req.params.id);
      await UserService.deleteUser(userId, req.user.userId);

      res.json({ message: '删除用户成功' });
    } catch (error) {
      console.error('删除用户错误:', error);
      res.status(500).json({ message: '删除用户失败' });
    }
  };

  /**
   * 批量删除用户
   */
  static deleteUsers = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权限访问' });
      }

      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: '请提供要删除的用户ID列表' });
      }

      const result = await UserService.deleteUsers(userIds, req.user.userId);

      res.json({
        message: '批量删除用户完成',
        data: result
      });
    } catch (error) {
      console.error('批量删除用户错误:', error);
      res.status(500).json({ message: '批量删除用户失败' });
    }
  };

  /**
   * 获取用户详情
   */
  static getUserDetail = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权限访问' });
      }

      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: '无效的用户ID' });
      }

      const user = await UserService.getUserDetail(userId, req.user.userId);

      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      res.json({
        message: '获取用户详情成功',
        data: user
      });
    } catch (error) {
      console.error('获取用户详情错误:', error);
      res.status(500).json({ message: '获取用户详情失败' });
    }
  };

  /**
   * 获取所有用户的详细信息
   */
  static getAllUsersDetails = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权限访问' });
      }

      const users = await UserService.getAllUsersDetails(req.user.userId);

      res.json({
        message: '获取所有用户详细信息成功',
        data: users
      });
    } catch (error) {
      console.error('获取所有用户详细信息错误:', error);
      res.status(500).json({ message: '获取所有用户详细信息失败' });
    }
  };
} 