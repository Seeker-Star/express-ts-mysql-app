import dotenv from 'dotenv';

// 加载测试环境变量
dotenv.config({ path: '.env.test' });

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';
process.env.DB_DATABASE = process.env.DB_DATABASE || 'test_db';
process.env.PORT = process.env.PORT || '0'; // 使用随机端口

// 设置测试超时
jest.setTimeout(10000);

beforeEach(() => {
  // 清理控制台输出
  jest.clearAllMocks();
});