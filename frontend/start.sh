#!/bin/bash

# GraphChef RAG Frontend 启动脚本

echo "========================================="
echo "  GraphChef RAG Frontend 启动脚本"
echo "========================================="
echo ""

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "检测到依赖未安装，正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 依赖安装失败"
        exit 1
    fi
    echo ""
fi

# 检查后端服务
echo "检查后端服务..."
if ! curl -s http://localhost:8000/api/health > /dev/null; then
    echo ""
    echo "警告: 后端服务未运行"
    echo "请先启动后端服务："
    echo "  cd ../graph_rag"
    echo "  python main.py"
    echo ""
    read -p "按 Enter 继续启动前端，或按 Ctrl+C 取消..."
fi

echo ""
echo "启动开发服务器..."
echo "前端地址: http://localhost:3000"
echo "API 代理: http://localhost:8000"
echo ""

npm run dev
