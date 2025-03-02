import { Router } from 'express';
import { checkAuth } from '../middlewares/auth';
import { ImageController } from '../controllers/imageController';
import multer from 'multer';
import * as path from 'path';

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE!) || 5 * 1024 * 1024 // 默认5MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许上传图片
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

const router = Router();

// 图像上传
router.post('/upload', checkAuth, upload.single('image'), ImageController.upload);

// 获取图像列表
router.get('/', checkAuth, ImageController.getImages);

// 获取图像详情
router.get('/:id/detail', checkAuth, ImageController.getImageDetail);

// 获取单个图像
router.get('/:id', checkAuth, ImageController.getImage);

// 更新图像状态
router.patch('/:id/status', checkAuth, ImageController.updateImageStatus);

// 删除单个图像
router.delete('/:id', checkAuth, ImageController.deleteImage);

// 批量删除图像
router.post('/batch-delete', checkAuth, ImageController.deleteImages);

// 任务相关的图片操作路由
router.post('/task/:taskId/add', checkAuth, ImageController.addToTask);
router.post('/task/:taskId/remove', checkAuth, ImageController.removeFromTask);
router.get('/task/:taskId/images', checkAuth, ImageController.getTaskImages);

export default router; 