import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

// 扩展 JwtPayload 接口以匹配我们的需求
interface CustomJwtPayload extends JwtPayload {
  userId?: number;
  username?: string;
  role?: string;
  // 兼容可能的其他字段名
  id?: number;
  sub?: string;
  user_id?: number;
}

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as CustomJwtPayload;
    
    // 调试输出，查看解码后的令牌内容
    console.log('解码后的令牌内容:', decoded);
    
    // 从不同可能的字段名中获取用户信息
    const userId = decoded.userId || decoded.id || decoded.user_id;
    const username = decoded.username || decoded.sub || 'unknown';
    const role = decoded.role || 'user'; // 默认为普通用户
    
    if (!userId) {
      console.error('令牌缺少用户ID字段:', decoded);
      return res.status(401).json({ message: '无效的认证令牌: 缺少用户ID' });
    }
    
    req.user = {
      userId: Number(userId),
      username,
      role
    };
    
    next();
  } catch (error) {
    console.error('令牌验证失败:', error);
    return res.status(401).json({ message: '认证失败: ' + (error instanceof Error ? error.message : '未知错误') });
  }
}; 