# main.py - 已基本正确，保持原样
"""
FastAPI主应用 - 异步版本
"""
import os
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.dependencies import cleanup_rag_system

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理 - 异步版本"""
    # 启动时
    logger.info("🚀 启动图RAG API服务...")
    logger.info("⚠️  注意：系统启动后需要手动构建知识库")

    yield

    # 关闭时
    logger.info("🛑 关闭API服务...")
    await cleanup_rag_system()  # 改为异步清理
    logger.info("✅ 服务已关闭")


# 创建FastAPI应用
app = FastAPI(
    title="图RAG烹饪助手API",
    description="基于图RAG的智能烹饪问答系统（手动构建知识库版本）",
    version="2.0.0",
    lifespan=lifespan
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 导入路由
from api.rag_router import router

app.include_router(router)


# 根路径 - 改为异步函数
@app.get("/")
async def root():
    """API首页"""
    return {
        "service": "图RAG烹饪助手API v2.0",
        "version": "2.0.0",
        "description": "异步版本",
        "important": "⚠️ 启动后需要先构建知识库才能使用问答功能",
        "endpoints": {
            "系统状态": "/api/system/status",
            "健康检查": "/api/health",
            "知识库管理": {
                "状态查询": "GET /api/knowledge-base/status",
                "构建/加载": "POST /api/knowledge-base/build",
                "卸载": "POST /api/knowledge-base/unload",
                "删除（慎用）": "DELETE /api/knowledge-base"
            },
            "问答功能": {
                "标准问答": "POST /api/ask",
                "流式问答": "POST /api/ask/stream"
            },
            "系统管理": {
                "重新加载": "POST /api/system/reload"
            },
            "API文档": "/docs",
            "Swagger UI": "/redoc"
        },
        "usage_steps": [
            "1. 启动服务后，首先调用 GET /api/health 检查服务状态",
            "2. 调用 POST /api/knowledge-base/build 构建知识库",
            "3. 调用 GET /api/knowledge-base/status 确认构建成功",
            "4. 开始使用 POST /api/ask 进行问答"
        ]
    }


if __name__ == "__main__":
    # 启动服务
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )