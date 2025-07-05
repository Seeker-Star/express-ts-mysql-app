# 部署指南

## 📋 部署前准备

### 1. 环境要求
- Node.js (推荐 v18 或更高版本)
- MySQL 数据库
- sshpass (用于自动化部署)

### 2. 数据库准备
在目标服务器的MySQL数据库中创建必要的表：

```sql
CREATE DATABASE your_database_name;
USE your_database_name;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. 环境变量配置

#### 本地配置
复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# 数据库配置（必需）
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_DATABASE=your_database_name

# 服务器配置
PORT=3000
NODE_ENV=production

# 部署配置
DEPLOY_SERVER_IP=your_server_ip
DEPLOY_SERVER_USER=root
DEPLOY_SERVER_PASSWORD=your_server_password
DEPLOY_DIR=~/node-service
PROJECT_NAME=express-ts-mysql-app
```

## 🚀 部署步骤

### 1. 本地部署
```bash
# 确保所有测试通过
npm test

# 执行部署脚本
./deploy.sh
```

### 2. 部署过程
部署脚本会自动执行以下步骤：

1. **📦 构建项目** - 编译TypeScript代码
2. **🔍 验证环境** - 检查.env文件中的必要配置
3. **📦 创建部署包** - 打包应用文件和配置
4. **📤 上传文件** - 上传到目标服务器
5. **🔧 服务器部署** - 在服务器上安装和启动服务
6. **✅ 验证部署** - 检查服务运行状态

### 3. 部署后验证

部署完成后，访问以下接口验证服务：

- **健康检查**: `http://服务器IP:3000/health`
- **用户列表**: `http://服务器IP:3000/users`
- **添加用户**: `http://服务器IP:3000/add-user`

## 🔧 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查服务器上的.env配置
cat ~/.node-service/.env

# 验证数据库连接
mysql -h DB_HOST -u DB_USER -p DB_DATABASE
```

#### 2. 服务启动失败
```bash
# 查看应用日志
tail -f ~/node-service/app.log

# 检查端口占用
netstat -tlnp | grep :3000

# 重启服务
cd ~/node-service
npm start
```

#### 3. 环境变量问题
```bash
# 重新配置环境变量
nano ~/node-service/.env

# 重启服务使配置生效
pkill -f "node dist/index.js"
npm start
```

### 环境变量说明

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `DB_HOST` | ✅ | 数据库主机地址 | `localhost` |
| `DB_USER` | ✅ | 数据库用户名 | `root` |
| `DB_PASSWORD` | ❌ | 数据库密码 | `password123` |
| `DB_DATABASE` | ✅ | 数据库名称 | `myapp_prod` |
| `PORT` | ❌ | 应用端口 | `3000` |
| `NODE_ENV` | ❌ | 运行环境 | `production` |

## 🔒 安全建议

### 1. 环境变量安全
- ❌ 不要将包含敏感信息的 `.env` 文件提交到Git
- ✅ 在服务器上手动配置生产环境变量
- ✅ 使用强密码和安全的数据库连接

### 2. 服务器安全
- 配置防火墙，仅开放必要端口
- 使用SSH密钥而非密码认证
- 定期更新系统和依赖包

### 3. 应用安全
- 启用HTTPS（使用反向代理如Nginx）
- 配置适当的CORS策略
- 实施访问控制和身份验证

## 📊 监控和维护

### 1. 日志监控
```bash
# 查看应用日志
tail -f ~/node-service/app.log

# 查看系统日志
tail -f ~/node-service/logs/combined.log
tail -f ~/node-service/logs/error.log
```

### 2. 性能监控
- 监控CPU和内存使用
- 监控数据库连接数
- 设置日志轮转避免磁盘空间问题

### 3. 备份策略
- 定期备份数据库
- 备份应用配置文件
- 制定灾难恢复计划

## 🔄 更新部署

更新应用时，只需重新运行部署脚本：

```bash
./deploy.sh
```

部署脚本会自动：
- 停止旧服务
- 备份旧版本
- 部署新版本
- 启动新服务

---

**注意**: 本文档基于当前项目结构编写，请根据实际部署环境调整配置。