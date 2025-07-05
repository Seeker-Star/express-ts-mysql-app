# 项目目录结构优化说明

## 📁 优化后的目录结构

```
express-ts-mysql-app/
├── src/                          # 源代码目录
│   ├── config/                   # 配置文件
│   │   ├── database.ts           # 数据库配置和连接
│   │   └── env.ts                # 环境变量配置
│   ├── controllers/              # 控制器层
│   │   └── userController.ts     # 用户控制器
│   ├── middleware/               # 中间件
│   │   ├── errorHandler.ts       # 错误处理中间件
│   │   └── logger.ts             # 日志中间件
│   ├── models/                   # 数据模型（暂为空）
│   ├── routes/                   # 路由定义
│   │   ├── index.ts              # 路由汇总
│   │   └── userRoutes.ts         # 用户路由
│   ├── services/                 # 业务服务层
│   │   └── userService.ts        # 用户服务
│   ├── types/                    # TypeScript 类型定义
│   │   └── user.ts               # 用户相关类型
│   ├── utils/                    # 工具函数
│   │   └── logger.ts             # 日志工具
│   ├── app.ts                    # 应用配置和初始化
│   └── index.ts                  # 应用入口文件
├── tests/                        # 测试文件
├── dist/                         # 编译后的文件
├── logs/                         # 日志文件
├── coverage/                     # 测试覆盖率报告
├── node_modules/                 # 依赖包
├── .env.test                     # 测试环境变量
├── jest.config.js                # Jest 配置
├── tsconfig.json                 # TypeScript 配置
├── package.json                  # 项目配置
└── README.md                     # 项目说明
```

## 🎯 优化特点

### 1. 分层架构
- **Controller Layer**: 处理HTTP请求和响应
- **Service Layer**: 业务逻辑处理
- **Config Layer**: 配置管理
- **Middleware Layer**: 中间件处理
- **Types Layer**: 类型定义

### 2. 单一职责
- 每个文件和目录都有明确的职责
- 代码按功能模块组织
- 便于维护和扩展

### 3. 依赖注入
- 数据库连接统一管理
- 环境配置集中处理
- 服务层解耦

## 📋 主要文件说明

### src/app.ts
应用主文件，负责：
- Express应用初始化
- 中间件配置
- 路由注册
- 错误处理

### src/config/
配置相关文件：
- `database.ts`: 数据库连接池和测试连接
- `env.ts`: 环境变量管理

### src/controllers/
控制器层：
- `userController.ts`: 处理用户相关的HTTP请求

### src/services/
业务服务层：
- `userService.ts`: 用户相关业务逻辑

### src/middleware/
中间件：
- `errorHandler.ts`: 全局错误处理和404处理
- `logger.ts`: 请求日志记录

### src/routes/
路由定义：
- `index.ts`: 路由汇总和健康检查
- `userRoutes.ts`: 用户相关路由

### src/types/
TypeScript类型：
- `user.ts`: 用户相关类型定义

### src/utils/
工具函数：
- `logger.ts`: Winston日志配置

## 🚀 优化带来的好处

### 1. 可维护性
- 代码结构清晰，易于理解
- 功能模块化，便于定位问题
- 符合常见的Node.js项目结构

### 2. 可扩展性
- 添加新功能时有明确的文件放置位置
- 支持多模块开发
- 便于团队协作

### 3. 可测试性
- 各层分离，便于单元测试
- Mock依赖更加容易
- 测试覆盖率更全面

### 4. 代码复用
- 服务层可被多个控制器使用
- 中间件可在多个路由中共享
- 工具函数统一管理

## 🔧 配置优化

### Jest配置更新
```javascript
collectCoverageFrom: [
  'src/**/*.ts',
  '!src/**/*.d.ts',
  '!src/index.ts',
  '!src/types/**/*.ts'  // 排除类型定义文件
]
```

### 路径引用
- 所有测试文件已更新引用路径
- 使用相对路径导入模块
- 保持一致的导入风格

## 📈 性能优化

### 1. 异步处理
- 数据库操作使用Promise
- 错误处理异步化
- 支持并发请求

### 2. 错误处理
- 全局错误捕获
- 分层错误处理
- 详细的错误日志

### 3. 中间件优化
- 请求响应时间记录
- 智能日志级别
- 安全头设置

---

**优化完成时间**: ${new Date().toLocaleString('zh-CN')}
**优化效果**: 结构清晰、易维护、可扩展