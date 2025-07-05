#!/bin/bash

# 加载环境变量
if [ -f .env ]; then
    # 安全地加载环境变量
    set -a
    source .env
    set +a
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
if ! npm run build; then
    echo "❌ 构建失败"
    exit 1
fi

# 2. 创建部署包
echo "📦 创建部署包..."
# 创建临时目录准备部署文件
mkdir -p deploy_temp
cp -r dist deploy_temp/
cp package.json deploy_temp/
cp package-lock.json deploy_temp/

# 检查是否存在.env.example并复制为.env模板
if [ -f .env.example ]; then
    cp .env.example deploy_temp/.env.example
fi

# 如果存在.env文件，验证并打包上传（用于生产环境配置）
if [ -f .env ]; then
    echo "📝 验证并包含环境配置文件..."
    
    # 检查必要的环境变量
    required_vars=("DB_HOST" "DB_USER" "DB_DATABASE")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        echo "✅ 环境配置验证通过"
        cp .env deploy_temp/.env
    else
        echo "⚠️  环境配置缺少必要变量: ${missing_vars[*]}"
        echo "📝 使用模板文件，部署后请手动配置"
        if [ -f .env.example ]; then
            cp .env.example deploy_temp/.env
        fi
    fi
else
    echo "📝 未找到 .env 文件，将使用模板"
fi

# 创建部署包
if ! tar -czf "${PROJECT_NAME}.tar.gz" -C deploy_temp .; then
    echo "❌ 创建部署包失败"
    rm -rf deploy_temp
    exit 1
fi

# 清理临时目录
rm -rf deploy_temp

# 3. 使用 sshpass 上传文件并执行部署
echo "📤 上传部署包到服务器..."
if ! sshpass -p "$SERVER_PASSWORD" scp "${PROJECT_NAME}.tar.gz" "${SERVER_USER}@${SERVER_IP}:${DEPLOY_DIR}/"; then
    echo "❌ 上传失败"
    exit 1
fi

# 4. 在服务器上执行部署命令
echo "🔧 在服务器上部署..."
sshpass -p "$SERVER_PASSWORD" ssh "${SERVER_USER}@${SERVER_IP}" << EOF
    # 设置错误退出
    set -e
    
    # 创建部署目录（如果不存在）
    mkdir -p "${DEPLOY_DIR}"
    cd "${DEPLOY_DIR}"
    
    echo "📍 当前工作目录: \$(pwd)"
    
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
    if [ -f "${PROJECT_NAME}.tar.gz" ]; then
        tar -xzf "${PROJECT_NAME}.tar.gz"
        echo "✅ 解压完成"
    else
        echo "❌ 部署包文件不存在: ${PROJECT_NAME}.tar.gz"
        exit 1
    fi
    
    # 检查解压后的文件
    echo "📋 检查解压后的文件:"
    ls -la
    
    # 检查并处理环境文件
    echo "📝 处理环境配置文件..."
    if [ -f .env ]; then
        echo "✅ 发现上传的环境配置文件"
        # 验证环境文件是否包含必要配置
        if grep -q "DB_HOST=" .env && grep -q "DB_USER=" .env && grep -q "DB_DATABASE=" .env; then
            echo "✅ 环境配置验证通过"
        else
            echo "⚠️  环境配置可能不完整，请检查以下必需变量:"
            echo "   - DB_HOST"
            echo "   - DB_USER" 
            echo "   - DB_DATABASE"
        fi
    elif [ -f .env.example ]; then
        echo "📝 从模板创建环境文件..."
        cp .env.example .env
        echo "⚠️  请编辑 ${DEPLOY_DIR}/.env 文件设置正确的环境变量:"
        echo "   - DB_HOST=your_database_host"
        echo "   - DB_USER=your_database_user"
        echo "   - DB_PASSWORD=your_database_password"
        echo "   - DB_DATABASE=your_database_name"
    else
        echo "❌ 未找到环境配置文件，创建默认配置..."
        cat > .env << 'ENVEOF'
# 数据库配置 - 请修改为实际值
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=express_app

# 服务器配置
PORT=3000
NODE_ENV=production
ENVEOF
        echo "⚠️  已创建默认 .env 文件，请编辑 ${DEPLOY_DIR}/.env 设置正确的数据库配置"
    fi
    
    # 检查必要文件
    echo "🔍 检查必要文件..."
    if [ ! -f package.json ]; then
        echo "❌ package.json 文件不存在"
        exit 1
    fi
    
    if [ ! -d dist ]; then
        echo "❌ dist 目录不存在"
        exit 1
    fi
    
    if [ ! -f dist/index.js ]; then
        echo "❌ dist/index.js 文件不存在"
        exit 1
    fi
    
    # 安装依赖
    echo "📥 安装依赖..."
    if ! npm install --production; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    
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

deployment_status=$?
if [ $deployment_status -eq 0 ]; then
    echo "🎉 部署完成！"
    echo "🌐 应用访问地址: http://${SERVER_IP}:3000"
    echo "🔍 健康检查: http://${SERVER_IP}:3000/health"
    echo "👥 用户列表: http://${SERVER_IP}:3000/users"
    echo "➕ 添加用户: http://${SERVER_IP}:3000/add-user"
    echo ""
    echo "📋 部署后检查清单:"
    echo "1. ✅ 访问健康检查接口确认服务正常"
    echo "2. ⚙️  配置服务器 ${DEPLOY_DIR}/.env 文件中的数据库连接"
    echo "3. 🗄️  确保数据库表已创建"
    echo "4. 🔒 配置防火墙开放端口 3000"
else
    echo "❌ 部署失败"
    exit 1
fi

# 清理本地部署包
rm -f "${PROJECT_NAME}.tar.gz"
echo "🧹 清理本地部署包完成"