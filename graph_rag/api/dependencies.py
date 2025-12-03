
# dependencies.py
"""
FastAPI依赖项 - 同步版本
"""

import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rag_modules.main_module import AdvancedGraphRAGSystem
from config import GraphRAGConfig

logger = logging.getLogger(__name__)

# 全局系统实例
_rag_system: Optional[AdvancedGraphRAGSystem] = None


def get_rag_system(config: Optional[GraphRAGConfig] = None) -> AdvancedGraphRAGSystem:
    """
    获取全局RAG系统实例（单例模式）
    注意：这是同步函数！
    修改：不再自动构建知识库
    """
    global _rag_system

    if _rag_system is None:
        logger.info("创建新的图RAG系统实例")
        _rag_system = AdvancedGraphRAGSystem(config)

        # 只初始化系统，不构建知识库
        logger.info("初始化系统模块...")
        try:
            _rag_system.initialize_system()
            logger.info("✅ 图RAG系统模块初始化完成")
            logger.info("⚠️  注意：知识库需要手动构建，请调用 /api/knowledge-base/build 接口")

        except Exception as e:
            logger.error(f"系统初始化失败: {e}")
            _rag_system = None
            raise

    return _rag_system


def get_rag_system_dependency() -> AdvancedGraphRAGSystem:
    """
    FastAPI依赖项：获取系统实例
    注意：这是同步函数！
    """
    try:
        system = get_rag_system()

        # 不再要求系统就绪，只检查系统是否存在
        if not system:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="RAG系统未初始化"
            )

        return system

    except Exception as e:
        logger.error(f"获取RAG系统失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"系统错误: {str(e)}"
        )


def cleanup_rag_system():
    """清理系统资源 - 同步函数"""
    global _rag_system
    if _rag_system:
        _rag_system._cleanup()
        _rag_system = None
        logger.info("系统资源已清理")