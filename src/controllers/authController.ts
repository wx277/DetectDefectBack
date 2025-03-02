import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/User';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export class AuthController {
  static register = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      // 验证请求数据
      if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
      }

      const userRepository = getRepository(User);
      
      // 检查用户是否已存在
      const existingUser = await userRepository.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      // 创建新用户
      const user = new User();
      user.username = username;
      user.password = await bcrypt.hash(password, 10);
      user.role = 'operator'; // 默认角色
      
      await userRepository.save(user);
      
      res.status(201).json({ 
        message: '注册成功',
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      // 验证请求数据
      if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { username } });

      if (!user) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }

      // 验证密码
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }

      // 检查用户状态
      if (user.status === 'blocked') {
        return res.status(403).json({ message: '账号已被封禁' });
      }

      // 更新最后登录时间
      user.last_login = new Date();
      await userRepository.save(user);

      // 生成 JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      res.json({ 
        message: '登录成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          status: user.status,
          last_login: user.last_login
        }
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  };
} 