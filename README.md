# Express TypeScript MySQL App

⚠️ **仅用于个人练习学习，无实际功能**

一个基于 Express + TypeScript + MySQL 的 Web 应用程序练习项目，用于学习和掌握相关技术栈。

## 学习内容

- 🚀 Express.js + TypeScript 基础架构
- 🗄️ MySQL 数据库连接和操作
- 📝 Winston 日志系统集成
- 🔐 用户认证系统和密码安全处理
- 🔑 环境变量管理和安全配置
- 🚢 自动化部署脚本编写
- 🏗️ 分层架构和模块化设计
- 🧪 完整的测试套件 (Jest + TypeScript)
- 📊 代码覆盖率报告

## 免责声明

此项目仅用于个人技术学习和练习，代码中可能包含示例数据和配置，不建议用于生产环境。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入真实的配置信息：

```env
# 数据库配置
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_DATABASE=your_database_name

# 服务器配置
PORT=3000
NODE_ENV=development

# 部署配置（可选）
DEPLOY_SERVER_IP=your_server_ip
DEPLOY_SERVER_USER=your_server_user
DEPLOY_SERVER_PASSWORD=your_server_password
DEPLOY_DIR=~/node-service
PROJECT_NAME=express-ts-mysql-app
```

### 3. 数据库设置

运行数据库初始化脚本：

```bash
npm run init-db
```

或者手动创建所需的表：

```sql
-- 创建用户表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255)
);

-- 创建认证用户表
CREATE TABLE auth_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. 运行应用

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm run build
npm start
```

## API 接口

### 用户认证
- `POST /register` - 用户注册

### 用户管理
- `GET /users` - 获取所有用户
- `GET /add-user` - 添加随机用户

### 系统
- `GET /health` - 健康检查接口

详细API文档请查看 [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 部署

使用自动化部署脚本：

```bash
./deploy.sh
```

确保在 `.env` 文件中配置了正确的部署信息。

## 日志系统

应用使用 Winston 进行日志管理：

- 开发环境：彩色控制台输出
- 生产环境：文件存储在 `logs/` 目录
- 支持日志轮转和结构化日志

## 项目结构

```
express-ts-mysql-app/
├── src/                          # 源代码目录
│   ├── config/                   # 配置文件
│   │   ├── database.ts           # 数据库配置和连接
│   │   ├── env.ts                # 环境变量配置
│   │   └── init-db.sql           # 数据库初始化SQL
│   ├── controllers/              # 控制器层
│   │   └── userController.ts     # 用户控制器
│   ├── middleware/               # 中间件
│   │   ├── errorHandler.ts       # 错误处理中间件
│   │   └── logger.ts             # 日志中间件
│   ├── routes/                   # 路由定义
│   │   ├── index.ts              # 路由汇总
│   │   └── userRoutes.ts         # 用户路由
│   ├── services/                 # 业务服务层
│   │   └── userService.ts        # 用户服务
│   ├── types/                    # TypeScript 类型定义
│   │   └── user.ts               # 用户相关类型
│   ├── utils/                    # 工具函数
│   │   ├── auth.ts               # 认证工具
│   │   └── logger.ts             # 日志工具
│   ├── app.ts                    # 应用配置和初始化
│   └── index.ts                  # 应用入口文件
├── scripts/                      # 脚本文件
│   └── init-db.js                # 数据库初始化脚本
├── tests/                        # 测试文件
│   ├── app.test.ts               # 应用配置测试
│   ├── database.test.ts          # 数据库测试
│   ├── integration.test.ts       # 集成测试
│   ├── logger.test.ts            # 日志模块测试
│   ├── routes.test.ts            # 路由测试
│   └── setup.ts                  # 测试环境配置
├── dist/                         # 编译后的文件
├── logs/                         # 日志文件
├── coverage/                     # 测试覆盖率报告
├── .env.test                     # 测试环境变量
├── jest.config.js                # Jest 配置
├── tsconfig.json                 # TypeScript 配置
├── deploy.sh                     # 部署脚本
├── TEST_REPORT.md                # 测试报告
├── STRUCTURE.md                  # 项目结构详细说明
└── README.md                     # 项目说明
```

## 安全说明

- 所有敏感信息已移动到 `.env` 文件
- `.env` 文件已添加到 `.gitignore`
- 使用 `.env.example` 作为配置模板
- 密码使用 bcrypt 进行安全哈希处理
- 用户名唯一性约束防止重复注册
- 输入验证和错误处理保护系统安全

## 架构特点

### 分层架构
- **Controller Layer**: 处理HTTP请求和响应
- **Service Layer**: 业务逻辑处理
- **Config Layer**: 配置管理
- **Middleware Layer**: 中间件处理
- **Types Layer**: TypeScript类型定义

### 核心特性
- 🏗️ **模块化设计**: 代码按功能分层组织
- 🔒 **类型安全**: 完善的TypeScript类型定义
- 🛡️ **错误处理**: 全局错误处理中间件
- 📝 **请求日志**: 详细的请求响应日志
- 🧪 **测试完整**: 42个测试用例，88.88%覆盖率
- ⚡ **异步处理**: Promise-based数据库操作

## 测试

```bash
# 运行所有测试
npm test

# 监视模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 测试覆盖
- **单元测试**: 各模块独立测试
- **集成测试**: 端到端工作流测试
- **性能测试**: 并发请求处理测试
- **错误处理**: 异常场景测试

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 启动
npm start
```

## 文档

- 📋 [测试报告](TEST_REPORT.md) - 详细的测试分析和覆盖率报告
- 🏗️ [结构说明](STRUCTURE.md) - 项目架构和优化详情
- 📚 [API文档](API_DOCUMENTATION.md) - 完整的接口文档和使用示例