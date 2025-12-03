
# api/rag_router.py
"""
唯一的API路由文件 - 同步版本
添加知识库管理API
"""

import time
import json
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import sys
import os

# 添加这行 - 设置项目根目录
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.dependencies import get_rag_system_dependency, cleanup_rag_system

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["问答"])


# 请求模型
class QuestionRequest(BaseModel):
    question: str
    stream: bool = False
    explain: bool = False


class KnowledgeBaseRequest(BaseModel):
    force_rebuild: bool = False


# 健康检查 - 改为同步
@router.get("/health")
def health_check(system=Depends(get_rag_system_dependency)):
    """健康检查"""
    return {
        "status": "healthy",
        "system_initialized": True,
        "knowledge_base_ready": system.knowledge_base_loaded if hasattr(system, 'knowledge_base_loaded') else False,
        "timestamp": time.time()
    }


# 知识库状态查询
@router.get("/knowledge-base/status")
def get_knowledge_base_status(system=Depends(get_rag_system_dependency)):
    """获取知识库状态"""
    try:
        status_info = system.get_knowledge_base_status()
        return {
            "success": True,
            "data": status_info
        }
    except Exception as e:
        logger.error(f"获取知识库状态失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取状态失败: {str(e)}"
        )


# 构建/加载知识库
@router.post("/knowledge-base/build")
def build_knowledge_base(
        request: KnowledgeBaseRequest = None,
        system=Depends(get_rag_system_dependency)
):
    """
    手动构建或加载知识库
    """
    if request is None:
        request = KnowledgeBaseRequest(force_rebuild=False)

    logger.info(f"构建知识库请求: force_rebuild={request.force_rebuild}")

    try:
        # 构建知识库
        result = system.load_or_build_knowledge_base(force_rebuild=request.force_rebuild)

        return {
            "success": True,
            "message": result["message"],
            "data": {
                "status": result["status"],
                "stats": result.get("stats", {})
            }
        }

    except Exception as e:
        logger.error(f"构建知识库失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"构建知识库失败: {str(e)}"
        )


# 卸载知识库
@router.post("/knowledge-base/unload")
def unload_knowledge_base(system=Depends(get_rag_system_dependency)):
    """卸载知识库"""
    try:
        result = system.unload_knowledge_base()
        return {
            "success": True,
            "message": result["message"]
        }
    except Exception as e:
        logger.error(f"卸载知识库失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"卸载知识库失败: {str(e)}"
        )


# 问答接口 - 改为同步
@router.post("/ask")
def ask_question(
        request: QuestionRequest,
        system=Depends(get_rag_system_dependency)
):
    """
    问答接口 - 同步版本
    直接调用原有的 ask_question_with_routing 方法
    """
    # 检查知识库是否已加载
    if not system.knowledge_base_loaded:
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail="知识库未加载，请先调用 /api/knowledge-base/build 接口"
        )

    # 简单验证
    if not request.question or len(request.question.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="问题不能为空"
        )

    if len(request.question) > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="问题太长（最多1000字符）"
        )

    start_time = time.time()

    try:
        # 直接调用原有的同步方法！
        answer, analysis = system.ask_question_with_routing(
            question=request.question,
            stream=False,  # 非流式
            explain_routing=request.explain
        )

        processing_time = time.time() - start_time

        # 构建响应
        response = {
            "success": True,
            "data": {
                "answer": answer,
                "processing_time": processing_time
            }
        }

        # 如果需要分析信息
        if request.explain and analysis:
            response["data"]["analysis"] = {
                "strategy": analysis.recommended_strategy.value if hasattr(analysis.recommended_strategy,
                                                                           'value') else str(
                    analysis.recommended_strategy),
                "complexity": getattr(analysis, 'query_complexity', 0),
                "confidence": getattr(analysis, 'confidence', 0)
            }

        logger.info(f"问题处理完成: '{request.question[:30]}...' 耗时: {processing_time:.2f}s")
        return response

    except Exception as e:
        logger.error(f"处理问题失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"处理失败: {str(e)}"
        )



# 系统状态 - 改为同步
@router.get("/system/status")
def get_system_status(system=Depends(get_rag_system_dependency)):
    """获取系统状态"""
    # 直接返回系统的一些基本信息
    return {
        "success": True,
        "data": {
            "system_ready": system.system_ready,
            "knowledge_base_loaded": system.knowledge_base_loaded,
            "config": {
                "llm_model": system.config.llm_model,
                "top_k": system.config.top_k
            }
        }
    }


# 重新加载 - 改为同步
@router.post("/system/reload")
def reload_system():
    """重新加载系统"""
    try:
        cleanup_rag_system()

        # 依赖项会自动重新初始化
        return {
            "success": True,
            "message": "系统已重新加载（知识库需要重新构建）"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"重新加载失败: {str(e)}"
        )


# 删除知识库（慎用）
@router.delete("/knowledge-base")
def delete_knowledge_base(system=Depends(get_rag_system_dependency)):
    """删除Milvus中的知识库集合"""
    try:
        if system.index_module and hasattr(system.index_module, 'delete_collection'):
            success = system.index_module.delete_collection()
            if success:
                system.knowledge_base_loaded = False
                system.system_ready = False
                return {
                    "success": True,
                    "message": "知识库已删除"
                }
            else:
                raise Exception("删除集合失败")
        else:
            raise Exception("索引模块未初始化")
    except Exception as e:
        logger.error(f"删除知识库失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除知识库失败: {str(e)}"
        )
