import * as fs from 'fs/promises';
import * as path from 'path';

export async function setupUploadDirectories() {
  const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
  const processedPath = path.join(uploadPath, 'processed');

  try {
    await fs.mkdir(uploadPath, { recursive: true });
    await fs.mkdir(processedPath, { recursive: true });
    console.log('上传目录创建成功');
  } catch (error) {
    console.error('创建上传目录失败:', error);
    throw error;
  }
} 