import express from 'express';
import config from './config/env';
import { testConnection } from './config/database';
import routes from './routes';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './utils/logger';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // 请求日志中间件
    this.app.use(requestLogger);
    
    // JSON解析中间件
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // 注册所有路由
    this.app.use('/', routes);
  }

  private initializeErrorHandling(): void {
    // 404处理
    this.app.use(notFoundHandler);
    
    // 全局错误处理
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // 测试数据库连接
      await testConnection();
      
      // 启动服务器
      this.app.listen(config.port, '0.0.0.0', () => {
        logger.info(`服务启动成功：http://0.0.0.0:${config.port}`, { 
          port: config.port, 
          env: config.env 
        });
      });
    } catch (error) {
      logger.error('应用启动失败', { error: error instanceof Error ? error.message : error });
      process.exit(1);
    }
  }
}

export default App;