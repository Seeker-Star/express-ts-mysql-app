# Express TypeScript MySQL App

一个基于 Express + TypeScript + MySQL 的 Web 应用程序，具有用户管理功能和完整的日志系统。

## 功能特性

- 🚀 Express.js + TypeScript 
- 🗄️ MySQL 数据库连接
- 📝 Winston 日志系统
- 🔐 环境变量管理
- 🚢 自动化部署脚本

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

确保你的 MySQL 数据库中有一个 `users` 表：

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255)
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

- `GET /users` - 获取所有用户
- `GET /add-user` - 添加随机用户

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
├── src/
│   ├── index.ts      # 主应用文件
│   └── logger.ts     # 日志配置
├── dist/             # 编译输出
├── logs/             # 日志文件
├── deploy.sh         # 部署脚本
├── .env              # 环境变量（不提交到 Git）
├── .env.example      # 环境变量模板
└── README.md         # 项目说明
```

## 安全说明

- 所有敏感信息已移动到 `.env` 文件
- `.env` 文件已添加到 `.gitignore`
- 使用 `.env.example` 作为配置模板

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 启动
npm start
```