@echo off
chcp 65001 > nul
echo =========================================
echo   GraphChef RAG Frontend 启动脚本
echo =========================================
echo.

REM 检查 node_modules 是否存在
if not exist "node_modules" (
    echo 检测到依赖未安装，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
    echo.
)

echo 检查后端服务...
curl -s http://localhost:8000/api/health > nul 2>&1
if errorlevel 1 (
    echo.
    echo 警告: 后端服务未运行
    echo 请先启动后端服务：
    echo   cd ..\graph_rag
    echo   python main.py
    echo.
    pause
)

echo.
echo 启动开发服务器...
echo 前端地址: http://localhost:3000
echo API 代理: http://localhost:8000
echo.

call npm run dev
