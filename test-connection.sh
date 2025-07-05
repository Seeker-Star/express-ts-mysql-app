#!/bin/bash

# 测试服务器连接
echo "🔍 测试服务器连接..."

# 加载环境变量
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# 部署配置
SERVER_IP=${DEPLOY_SERVER_IP:-""}
SERVER_USER=${DEPLOY_SERVER_USER:-"root"}
SERVER_PASSWORD=${DEPLOY_SERVER_PASSWORD:-""}
DEPLOY_DIR=${DEPLOY_DIR:-"~/node-service"}

# 检查必要的环境变量
if [ -z "$SERVER_IP" ] || [ -z "$SERVER_PASSWORD" ]; then
    echo "❌ 请在.env文件中设置DEPLOY_SERVER_IP和DEPLOY_SERVER_PASSWORD"
    exit 1
fi

echo "📋 连接配置信息:"
echo "   服务器IP: $SERVER_IP"
echo "   用户名: $SERVER_USER"
echo "   部署目录: $DEPLOY_DIR"

# 测试SSH连接
echo ""
echo "🔗 测试SSH连接..."
if sshpass -p "$SERVER_PASSWORD" ssh -o ConnectTimeout=10 "${SERVER_USER}@${SERVER_IP}" "echo 'SSH连接成功'; whoami; pwd"; then
    echo "✅ SSH连接测试通过"
else
    echo "❌ SSH连接失败"
    echo "🔧 请检查:"
    echo "1. 服务器IP是否正确"
    echo "2. 用户名和密码是否正确"
    echo "3. 服务器是否允许SSH连接"
    echo "4. 网络连接是否正常"
    exit 1
fi

# 测试目录创建
echo ""
echo "📁 测试目录创建..."
if sshpass -p "$SERVER_PASSWORD" ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p '${DEPLOY_DIR}' && echo '目录路径:' && realpath '${DEPLOY_DIR}' && ls -la '${DEPLOY_DIR}'"; then
    echo "✅ 目录创建测试通过"
else
    echo "❌ 目录创建失败"
    exit 1
fi

echo ""
echo "🎉 连接测试完成！服务器连接正常。"