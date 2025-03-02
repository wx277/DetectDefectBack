import { Request, Response } from 'express';
import { DetectionService } from '../services/detectionService';

export class DetectionController {
  // 执行缺陷检测
  static analyze = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const imageId = parseInt(req.params.imageId);
      const detections = await DetectionService.detectDefects(imageId, req.user.userId);

      res.json({
        message: '检测完成',
        data: {
          detections: detections.map(detection => ({
            id: detection.id,
            defect_type: detection.defect_type,
            confidence: detection.confidence,
            location: detection.location,
            detection_time: detection.detection_time
          }))
        }
      });
    } catch (error) {
      console.error('检测错误:', error);
      res.status(500).json({ message: '检测失败' });
    }
  };

  // 获取检测结果
  static getResults = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const imageId = parseInt(req.params.imageId);
      const results = await DetectionService.getDetectionResults(imageId, req.user.userId);

      res.json({
        message: '获取检测结果成功',
        data: { results }
      });
    } catch (error) {
      console.error('获取检测结果错误:', error);
      res.status(500).json({ message: '获取检测结果失败' });
    }
  };

  // 获取检测统计信息
  static getStats = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const stats = await DetectionService.getDetectionStats(req.user.userId);

      res.json({
        message: '获取统计信息成功',
        data: { stats }
      });
    } catch (error) {
      console.error('获取统计信息错误:', error);
      res.status(500).json({ message: '获取统计信息失败' });
    }
  };
} 