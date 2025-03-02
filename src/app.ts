import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import { config } from 'dotenv';
import { dbConfig } from './config/database';
import routes from './routes';
import { setupUploadDirectories } from './utils/setupUploadDir';
import cors from 'cors';

config(); // 加载环境变量

const app = express();

// 添加 CORS 中间件支持跨域请求
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // 允许的来源，可以从环境变量读取或允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // 允许携带凭证（cookies等）
  maxAge: 86400 // 预检请求结果缓存时间（秒）
}));

// 解析 JSON 请求体
app.use(express.json());
// 解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true }));

// 创建上传目录
setupUploadDirectories().catch(error => {
  console.error('初始化上传目录失败:', error);
  process.exit(1);
});

// 路由
app.use('/api', routes);

// 数据库连接
createConnection(dbConfig).then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  });
}).catch(error => console.log('TypeORM connection error: ', error)); 