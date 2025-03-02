import { getRepository, Like } from 'typeorm';
import { User } from '../models/User';
import * as bcrypt from 'bcryptjs';

export class UserService {
  /**
   * 获取所有用户信息（支持搜索）
   * @param search 搜索关键词
   * @param page 页码
   * @param limit 每页数量
   */
  static async getAllUsers(
    search?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number }> {
    const userRepository = getRepository(User);
    
    const whereCondition = search ? {
      username: Like(`%${search}%`)
    } : {};

    const [users, total] = await userRepository.findAndCount({
      where: whereCondition,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'username', 'role', 'status', 'last_login', 'created_at'] // 排除密码字段
    });

    return { users, total };
  }

  /**
   * 更新用户信息
   * @param userId 被更新的用户ID
   * @param adminId 管理员ID
   * @param data 更新的数据
   */
  static async updateUser(
    userId: number,
    adminId: number,
    data: {
      username?: string;
      password?: string;
      role?: string;
      status?: string;
    }
  ): Promise<User> {
    const userRepository = getRepository(User);

    // 验证管理员身份
    const admin = await userRepository.findOne({
      where: { id: adminId, role: 'admin' }
    });

    if (!admin) {
      throw new Error('无管理员权限');
    }

    // 获取要更新的用户
    const user = await userRepository.findOne(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 如果要更新用户名，检查是否已存在
    if (data.username && data.username !== user.username) {
      const existingUser = await userRepository.findOne({
        where: { username: data.username }
      });
      if (existingUser) {
        throw new Error('用户名已存在');
      }
      user.username = data.username;
    }

    // 更新密码
    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    // 更新角色
    if (data.role) {
      user.role = data.role;
    }

    // 更新状态
    if (data.status) {
      user.status = data.status;
    }

    return await userRepository.save(user);
  }

  /**
   * 删除用户
   * @param userId 要删除的用户ID
   * @param adminId 管理员ID
   */
  static async deleteUser(userId: number, adminId: number): Promise<boolean> {
    const userRepository = getRepository(User);

    // 验证管理员身份
    const admin = await userRepository.findOne({
      where: { id: adminId, role: 'admin' }
    });

    if (!admin) {
      throw new Error('无管理员权限');
    }

    // 不能删除自己
    if (userId === adminId) {
      throw new Error('不能删除自己的账号');
    }

    const user = await userRepository.findOne(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    await userRepository.remove(user);
    return true;
  }

  /**
   * 批量删除用户
   * @param userIds 要删除的用户ID数组
   * @param adminId 管理员ID
   */
  static async deleteUsers(userIds: number[], adminId: number): Promise<{
    success: number;
    failed: number;
  }> {
    const userRepository = getRepository(User);
    let success = 0;
    let failed = 0;

    // 验证管理员身份
    const admin = await userRepository.findOne({
      where: { id: adminId, role: 'admin' }
    });

    if (!admin) {
      throw new Error('无管理员权限');
    }

    for (const userId of userIds) {
      try {
        if (userId === adminId) {
          failed++;
          continue; // 跳过删除自己
        }

        const user = await userRepository.findOne(userId);
        if (user) {
          await userRepository.remove(user);
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`删除用户 ${userId} 失败:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * 获取用户详细信息
   * @param userId 用户ID
   * @param adminId 管理员ID
   */
  static async getUserDetail(userId: number, adminId: number): Promise<User | undefined> {
    const userRepository = getRepository(User);

    // 验证管理员身份
    const admin = await userRepository.findOne({
      where: { id: adminId, role: 'admin' }
    });

    if (!admin) {
      throw new Error('无管理员权限');
    }

    return await userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'role', 'status', 'last_login', 'created_at']
    });
  }

  /**
   * 获取所有用户的详细信息
   * @param adminId 管理员ID
   */
  static async getAllUsersDetails(adminId: number): Promise<User[]> {
    const userRepository = getRepository(User);

    // 验证管理员身份
    const admin = await userRepository.findOne({
      where: { id: adminId, role: 'admin' }
    });

    if (!admin) {
      throw new Error('无管理员权限');
    }

    return await userRepository.find({
      select: ['id', 'username', 'role', 'status', 'last_login', 'created_at'],
      order: {
        created_at: 'DESC'
      }
    });
  }
} 