#!/bin/bash

# 加载环境变量
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 部署配置
SERVER_IP=${DEPLOY_SERVER_IP:-""}
SERVER_USER=${DEPLOY_SERVER_USER:-"root"}
SERVER_PASSWORD=${DEPLOY_SERVER_PASSWORD:-""}
DEPLOY_DIR=${DEPLOY_DIR:-"~/node-service"}
PROJECT_NAME=${PROJECT_NAME:-"express-ts-mysql-app"}

# 检查必要的环境变量
if [ -z "$SERVER_IP" ] || [ -z "$SERVER_PASSWORD" ]; then
    echo "❌ 请在.env文件中设置DEPLOY_SERVER_IP和DEPLOY_SERVER_PASSWORD"
    exit 1
fi

echo "🚀 开始部署到服务器 $SERVER_IP..."

# 1. 构建项目
echo "📦 构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 2. 创建部署包
echo "📦 创建部署包..."
# 创建临时目录准备部署文件
mkdir -p deploy_temp
cp -r dist/ deploy_temp/
cp package.json deploy_temp/
cp package-lock.json deploy_temp/

# 检查是否存在.env.example并复制为.env模板
if [ -f .env.example ]; then
    cp .env.example deploy_temp/.env.example
fi

# 创建部署包
tar -czf ${PROJECT_NAME}.tar.gz -C deploy_temp .
if [ $? -ne 0 ]; then
    echo "❌ 创建部署包失败"
    rm -rf deploy_temp
    exit 1
fi

# 清理临时目录
rm -rf deploy_temp

# 3. 使用 sshpass 上传文件并执行部署
echo "📤 上传部署包到服务器..."
sshpass -p "$SERVER_PASSWORD" scp ${PROJECT_NAME}.tar.gz ${SERVER_USER}@${SERVER_IP}:${DEPLOY_DIR}/

if [ $? -ne 0 ]; then
    echo "❌ 上传失败"
    exit 1
fi

# 4. 在服务器上执行部署命令
echo "🔧 在服务器上部署..."
sshpass -p "$SERVER_PASSWORD" ssh ${SERVER_USER}@${SERVER_IP} << EOF
    cd ${DEPLOY_DIR}
    
    # 停止现有服务
    echo "🛑 停止现有服务..."
    pkill -f "node dist/index.js" || true
    
    # 备份旧版本
    if [ -d "dist" ]; then
        echo "📂 备份旧版本..."
        rm -rf dist_backup
        mv dist dist_backup
    fi
    
    # 解压新版本
    echo "📦 解压新版本..."
    tar -xzf ${PROJECT_NAME}.tar.gz
    
    # 检查并创建环境文件
    if [ ! -f .env ] && [ -f .env.example ]; then
        echo "📝 创建环境文件..."
        cp .env.example .env
        echo "⚠️  请手动编辑 .env 文件设置正确的环境变量"
    fi
    
    # 安装依赖
    echo "📥 安装依赖..."
    npm install --production
    
    # 检查必要目录
    mkdir -p logs
    
    # 启动服务
    echo "🚀 启动服务..."
    nohup npm start > app.log 2>&1 &
    
    # 等待服务启动
    sleep 3
    
    # 检查服务状态
    if pgrep -f "node dist/index.js" > /dev/null; then
        echo "✅ 服务启动成功"
        echo "🌐 访问地址: http://${SERVER_IP}:3000"
        echo "🔍 健康检查: http://${SERVER_IP}:3000/health"
    else
        echo "❌ 服务启动失败，查看日志:"
        tail -20 app.log
        echo ""
        echo "🔧 可能的解决方案:"
        echo "1. 检查 .env 文件中的数据库配置"
        echo "2. 确保 MySQL 服务正在运行"
        echo "3. 验证数据库连接信息"
        echo "4. 检查端口 3000 是否被占用"
        exit 1
    fi
EOF

if [ $? -eq 0 ]; then
    echo "🎉 部署完成！"
    echo "🌐 应用访问地址: http://${SERVER_IP}:3000"
    echo "🔍 健康检查: http://${SERVER_IP}:3000/health"
    echo "👥 用户列表: http://${SERVER_IP}:3000/users"
    echo "➕ 添加用户: http://${SERVER_IP}:3000/add-user"
    echo ""
    echo "📋 部署后检查清单:"
    echo "1. ✅ 访问健康检查接口确认服务正常"
    echo "2. ⚙️  配置服务器 .env 文件中的数据库连接"
    echo "3. 🗄️  确保数据库表已创建"
    echo "4. 🔒 配置防火墙开放端口 3000"
else
    echo "❌ 部署失败"
    exit 1
fi

# 清理本地部署包
rm -f ${PROJECT_NAME}.tar.gz
echo "🧹 清理本地部署包完成"