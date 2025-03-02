import { ConnectionOptions } from 'typeorm';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { Image } from '../models/Image';
import { Detection } from '../models/Detection';
import { Report } from '../models/Report';
import * as dotenv from 'dotenv';//dotenv 是用于加载环境变量的包，确保 .env 文件中的配置能够被加载到 process.env 中


//读取 .env 文件中的配置，并将这些变量加载到 process.env 对象中
dotenv.config();

export const dbConfig: ConnectionOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User, Task, Image, Detection, Report],
  synchronize: true, // 开发环境使用，生产环境要关闭
  // logging: true // 开启SQL日志
};

// 打印配置信息
// console.log('Database Configuration:', {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   username: process.env.DB_USER,
//   database: process.env.DB_NAME
// }); 