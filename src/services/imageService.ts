import { getRepository } from 'typeorm';
import { Image } from '../models/Image';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Task } from '../models/Task';

export class ImageService {
  static async saveImage(
    file: Express.Multer.File,
    userId: number
  ): Promise<Image> {
    const imageRepository = getRepository(Image);

    // 处理图像
    const processedPath = path.join(process.env.UPLOAD_PATH!, 'processed', file.filename);
    await sharp(file.path)
      .resize(800, 600, { fit: 'inside' }) // 调整图像大小
      .jpeg({ quality: 80 }) // 转换为 JPEG 格式并压缩
      .toFile(processedPath);

    // 创建图像记录
    const image = new Image();
    image.filename = file.filename;
    image.path = processedPath;
    image.user_id = userId;
    image.status = 'pending';

    return await imageRepository.save(image);
  }

  static async getImage(id: number, userId: number): Promise<Image | undefined> {
    const imageRepository = getRepository(Image);
    return await imageRepository.findOne({
      where: { id, user_id: userId }
    });
  }

  static async deleteImage(id: number, userId: number): Promise<boolean> {
    const imageRepository = getRepository(Image);
    const image = await imageRepository.findOne({
      where: { id, user_id: userId }
    });

    if (!image) {
      return false;
    }

    // 删除文件
    try {
      await fs.unlink(image.path);
      await imageRepository.remove(image);
      return true;
    } catch (error) {
      console.error('删除图像失败:', error);
      return false;
    }
  }

  // 获取图像列表
  static async getImages(userId: number, page: number = 1, limit: number = 10): Promise<{
    images: Image[];
    total: number;
  }> {
    const imageRepository = getRepository(Image);
    const [images, total] = await imageRepository.findAndCount({
      where: { user_id: userId },
      order: { upload_time: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'] // 加载用户信息
    });

    return { images, total };
  }

  // 获取图像详情
  static async getImageDetail(id: number, userId: number): Promise<Image | undefined> {
    const imageRepository = getRepository(Image);
    return await imageRepository.findOne({
      where: { id, user_id: userId },
      relations: ['user']
    });
  }

  // 更新图像状态
  static async updateImageStatus(id: number, userId: number, status: string): Promise<Image | undefined> {
    const imageRepository = getRepository(Image);
    const image = await imageRepository.findOne({
      where: { id, user_id: userId }
    });

    if (!image) {
      return undefined;
    }

    image.status = status;
    return await imageRepository.save(image);
  }

  // 批量删除图像
  static async deleteImages(ids: number[], userId: number): Promise<{
    success: number;
    failed: number;
  }> {
    const imageRepository = getRepository(Image);
    let success = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const image = await imageRepository.findOne({
          where: { id, user_id: userId }
        });

        if (image) {
          await fs.unlink(image.path);
          await imageRepository.remove(image);
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`删除图像 ${id} 失败:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * 将已有图片添加到任务中
   * @param imageIds 图片ID数组
   * @param taskId 任务ID
   * @param userId 用户ID
   */
  static async addImagesToTask(
    imageIds: number[],
    taskId: number,
    userId: number
  ): Promise<{ success: number; failed: number }> {
    const imageRepository = getRepository(Image);
    const taskRepository = getRepository(Task);

    // 验证任务是否存在且属于该用户
    const task = await taskRepository.findOne({
      where: { id: taskId, user_id: userId }
    });

    if (!task) {
      throw new Error('任务不存在或无权访问');
    }

    let success = 0;
    let failed = 0;

    // 批量更新图片的任务ID
    for (const imageId of imageIds) {
      try {
        const image = await imageRepository.findOne({
          where: { id: imageId, user_id: userId }
        });

        if (image) {
          image.task_id = taskId;
          await imageRepository.save(image);
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`添加图片 ${imageId} 到任务失败:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * 从任务中移除图片（不删除图片，只解除关联）
   * @param imageIds 图片ID数组
   * @param taskId 任务ID
   * @param userId 用户ID
   */
  static async removeImagesFromTask(
    imageIds: number[],
    taskId: number,
    userId: number
  ): Promise<{ success: number; failed: number }> {
    const imageRepository = getRepository(Image);
    let success = 0;
    let failed = 0;

    for (const imageId of imageIds) {
      try {
        const image = await imageRepository.findOne({
          where: { id: imageId, task_id: taskId, user_id: userId }
        });

        if (image) {
          image.task_id = null; // 解除与任务的关联
          await imageRepository.save(image);
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`从任务移除图片 ${imageId} 失败:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * 获取任务中的所有图片
   * @param taskId 任务ID
   * @param userId 用户ID
   */
  static async getTaskImages(
    taskId: number,
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ images: Image[]; total: number }> {
    const imageRepository = getRepository(Image);

    const [images, total] = await imageRepository.findAndCount({
      where: { task_id: taskId, user_id: userId },
      order: { upload_time: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { images, total };
  }
} 