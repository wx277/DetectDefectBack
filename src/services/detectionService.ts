import { getRepository } from 'typeorm';
import { Detection } from '../models/Detection';
import { Image } from '../models/Image';
import { AIService } from './aiService';

export class DetectionService {
  // 执行缺陷检测
  static async detectDefects(imageId: number, userId: number): Promise<Detection[]> {
    const imageRepository = getRepository(Image);
    const detectionRepository = getRepository(Detection);

    // 获取图像信息
    const image = await imageRepository.findOne({
      where: { id: imageId, user_id: userId }
    });

    if (!image) {
      throw new Error('图像不存在');
    }

    try {
      // 更新图像状态为处理中
      image.status = 'processing';
      await imageRepository.save(image);

      // 调用 AI 服务进行检测
      const defects = await AIService.detectDefects(image.path);

      // 保存检测结果
      const detections = await Promise.all(
        defects.map(async (defect) => {
          const detection = new Detection();
          detection.image_id = imageId;
          detection.defect_type = defect.type;
          detection.confidence = defect.confidence;
          detection.location = defect.location;
          return await detectionRepository.save(detection);
        })
      );

      // 更新图像状态为完成
      image.status = 'completed';
      await imageRepository.save(image);

      return detections;
    } catch (error) {
      // 更新图像状态为失败
      image.status = 'failed';
      await imageRepository.save(image);
      throw error;
    }
  }

  // 获取检测结果
  static async getDetectionResults(imageId: number, userId: number): Promise<Detection[]> {
    const imageRepository = getRepository(Image);
    const detectionRepository = getRepository(Detection);

    // 验证图像所有权
    const image = await imageRepository.findOne({
      where: { id: imageId, user_id: userId }
    });

    if (!image) {
      throw new Error('图像不存在');
    }

    return await detectionRepository.find({
      where: { image_id: imageId },
      order: { detection_time: 'DESC' }
    });
  }

  // 获取检测统计信息
  static async getDetectionStats(userId: number): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const imageRepository = getRepository(Image);
    const detectionRepository = getRepository(Detection);

    // 获取用户的所有图像
    const images = await imageRepository.find({
      where: { user_id: userId }
    });

    const imageIds = images.map(img => img.id);

    // 获取所有检测结果
    const detections = await detectionRepository.find({
      where: { image_id: imageIds }
    });

    // 统计信息
    const stats = {
      total: detections.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>
    };

    // 按缺陷类型统计
    detections.forEach(detection => {
      stats.byType[detection.defect_type] = (stats.byType[detection.defect_type] || 0) + 1;
    });

    // 按状态统计
    images.forEach(image => {
      stats.byStatus[image.status] = (stats.byStatus[image.status] || 0) + 1;
    });

    return stats;
  }
} 