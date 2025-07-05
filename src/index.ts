import App from './app';

// 创建并启动应用
const app = new App();
app.start().catch((error) => {
  console.error('应用启动失败:', error);
  process.exit(1);
});