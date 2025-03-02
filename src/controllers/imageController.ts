import { Request, Response } from 'express';
import { ImageService } from '../services/imageService';

export class ImageController {
  static upload = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '没有上传文件' });
      }

      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const image = await ImageService.saveImage(req.file, req.user.userId);

      res.status(201).json({
        message: '图像上传成功',
        image: {
          id: image.id,
          filename: image.filename,
          status: image.status,
          upload_time: image.upload_time
        }
      });
    } catch (error) {
      console.error('上传错误:', error);
      res.status(500).json({ message: '图像上传失败' });
    }
  };

  static getImage = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const image = await ImageService.getImage(
        parseInt(req.params.id),
        req.user.userId
      );

      if (!image) {
        return res.status(404).json({ message: '图像不存在' });
      }

      res.json(image);
    } catch (error) {
      console.error('获取图像错误:', error);
      res.status(500).json({ message: '获取图像失败' });
    }
  };

  static deleteImage = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const success = await ImageService.deleteImage(
        parseInt(req.params.id),
        req.user.userId
      );

      if (!success) {
        return res.status(404).json({ message: '图像不存在或删除失败' });
      }

      res.json({ message: '图像删除成功' });
    } catch (error) {
      console.error('删除图像错误:', error);
      res.status(500).json({ message: '删除图像失败' });
    }
  };

  // 获取图像列表
  static getImages = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { images, total } = await ImageService.getImages(req.user.userId, page, limit);

      res.json({
        message: '获取图像列表成功',
        data: {
          images: images.map(image => ({
            id: image.id,
            filename: image.filename,
            status: image.status,
            upload_time: image.upload_time
          })),
          pagination: {
            current: page,
            size: limit,
            total
          }
        }
      });
    } catch (error) {
      console.error('获取图像列表错误:', error);
      res.status(500).json({ message: '获取图像列表失败' });
    }
  };

  // 获取图像详情
  static getImageDetail = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const image = await ImageService.getImageDetail(
        parseInt(req.params.id),
        req.user.userId
      );

      if (!image) {
        return res.status(404).json({ message: '图像不存在' });
      }

      res.json({
        message: '获取图像详情成功',
        data: {
          id: image.id,
          filename: image.filename,
          path: image.path,
          status: image.status,
          upload_time: image.upload_time,
          user: {
            id: image.user.id,
            username: image.user.username
          }
        }
      });
    } catch (error) {
      console.error('获取图像详情错误:', error);
      res.status(500).json({ message: '获取图像详情失败' });
    }
  };

  // 更新图像状态
  static updateImageStatus = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const { status } = req.body;
      if (!['pending', 'processing', 'completed', 'failed'].includes(status)) {
        return res.status(400).json({ message: '无效的状态值' });
      }

      const image = await ImageService.updateImageStatus(
        parseInt(req.params.id),
        req.user.userId,
        status
      );

      if (!image) {
        return res.status(404).json({ message: '图像不存在' });
      }

      res.json({
        message: '更新状态成功',
        data: {
          id: image.id,
          status: image.status
        }
      });
    } catch (error) {
      console.error('更新状态错误:', error);
      res.status(500).json({ message: '更新状态失败' });
    }
  };

  // 批量删除图像
  static deleteImages = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: '请提供要删除的图像ID列表' });
      }

      const result = await ImageService.deleteImages(ids, req.user.userId);

      res.json({
        message: '批量删除完成',
        data: result
      });
    } catch (error) {
      console.error('批量删除错误:', error);
      res.status(500).json({ message: '批量删除失败' });
    }
  };

  /**
   * 将图片添加到任务中
   */
  static addToTask = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const taskId = parseInt(req.params.taskId);
      const { imageIds } = req.body;

      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        return res.status(400).json({ message: '请提供要添加的图片ID列表' });
      }

      const result = await ImageService.addImagesToTask(
        imageIds,
        taskId,
        req.user.userId
      );

      res.json({
        message: '添加图片到任务完成',
        data: result
      });
    } catch (error) {
      console.error('添加图片到任务错误:', error);
      res.status(500).json({ message: '添加图片到任务失败' });
    }
  };

  /**
   * 从任务中移除图片
   */
  static removeFromTask = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const taskId = parseInt(req.params.taskId);
      const { imageIds } = req.body;

      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        return res.status(400).json({ message: '请提供要移除的图片ID列表' });
      }

      const result = await ImageService.removeImagesFromTask(
        imageIds,
        taskId,
        req.user.userId
      );

      res.json({
        message: '从任务移除图片完成',
        data: result
      });
    } catch (error) {
      console.error('从任务移除图片错误:', error);
      res.status(500).json({ message: '从任务移除图片失败' });
    }
  };

  /**
   * 获取任务中的图片列表
   */
  static getTaskImages = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未授权' });
      }

      const taskId = parseInt(req.params.taskId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { images, total } = await ImageService.getTaskImages(
        taskId,
        req.user.userId,
        page,
        limit
      );

      res.json({
        message: '获取任务图片列表成功',
        data: {
          images: images.map(image => ({
            id: image.id,
            filename: image.filename,
            status: image.status,
            upload_time: image.upload_time
          })),
          pagination: {
            current: page,
            size: limit,
            total
          }
        }
      });
    } catch (error) {
      console.error('获取任务图片列表错误:', error);
      res.status(500).json({ message: '获取任务图片列表失败' });
    }
  };
} 