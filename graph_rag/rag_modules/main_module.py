
"""
基于图RAG的智能烹饪助手 - 主程序
整合传统检索和图RAG检索，实现真正的图数据优势
"""

import os
import sys
import time
import logging
from typing import List, Optional, Dict, Any

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from config import DEFAULT_CONFIG, GraphRAGConfig
from rag_modules.graph_data_preparation import GraphDataPreparationModule
from rag_modules.milvus_index_construction import MilvusIndexConstructionModule
from rag_modules.generation_integration import GenerationIntegrationModule
from rag_modules.hybrid_retrieval import HybridRetrievalModule
from rag_modules.graph_rag_retrieval import GraphRAGRetrieval
from rag_modules.intelligent_query_router import IntelligentQueryRouter

# 加载环境变量
load_dotenv()


class AdvancedGraphRAGSystem:
    """
    图RAG系统
    修改：移除自动构建知识库，改为手动控制
    """

    def __init__(self, config: Optional[GraphRAGConfig] = None):
        self.config = config or DEFAULT_CONFIG

        # 核心模块
        self.data_module = None
        self.index_module = None
        self.generation_module = None

        # 检索引擎
        self.traditional_retrieval = None
        self.graph_rag_retrieval = None
        self.query_router = None

        # 系统状态
        self.system_ready = False
        self.knowledge_base_loaded = False

    def initialize_system(self):
        """初始化高级图RAG系统（不自动构建知识库）"""
        logger.info("启动高级图RAG系统...")

        try:
            # 1. 数据准备模块
            print("初始化数据准备模块...")
            self.data_module = GraphDataPreparationModule(
                uri=self.config.neo4j_uri,
                user=self.config.neo4j_user,
                password=self.config.neo4j_password,
                database=self.config.neo4j_database
            )

            # 2. 向量索引模块（但不自动构建）
            print("初始化Milvus向量索引模块...")
            self.index_module = MilvusIndexConstructionModule(
                host=self.config.milvus_host,
                port=self.config.milvus_port,
                collection_name=self.config.milvus_collection_name,
                dimension=self.config.milvus_dimension,
                model_name=self.config.embedding_model
            )

            # 3. 生成模块
            print("初始化生成模块...")
            self.generation_module = GenerationIntegrationModule(
                model_name=self.config.llm_model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens
            )

            print("✅ 高级图RAG系统模块初始化完成！")
            print("⚠️  注意：知识库需要手动构建")

        except Exception as e:
            logger.error(f"系统初始化失败: {e}")
            raise

    def load_or_build_knowledge_base(self, force_rebuild: bool = False) -> Dict[str, Any]:
        """
        手动加载或构建知识库
        
        Args:
            force_rebuild: 是否强制重新构建（删除旧数据）
            
        Returns:
            构建结果信息
        """
        print("\n检查知识库状态...")

        try:
            # 检查Milvus集合是否存在
            if self.index_module.has_collection() and not force_rebuild:
                print("✅ 发现已存在的知识库，尝试加载...")
                if self.index_module.load_collection():
                    print("知识库加载成功！")
                    
                    # 加载图数据以支持图索引
                    print("加载图数据以支持图检索...")
                    self.data_module.load_graph_data()
                    print("构建菜谱文档...")
                    self.data_module.build_recipe_documents()
                    print("进行文档分块...")
                    chunks = self.data_module.chunk_documents(
                        chunk_size=self.config.chunk_size,
                        chunk_overlap=self.config.chunk_overlap
                    )

                    self._initialize_retrievers(chunks)
                    
                    result = {
                        "status": "loaded",
                        "message": "从现有集合加载成功",
                        "stats": self._get_knowledge_base_stats()
                    }
                    
                    self.knowledge_base_loaded = True
                    return result
                else:
                    print("❌ 知识库加载失败，开始构建...")

            print("开始构建新的知识库...")

            # 从Neo4j加载图数据
            print("从Neo4j加载图数据...")
            self.data_module.load_graph_data()

            # 构建菜谱文档
            print("构建菜谱文档...")
            self.data_module.build_recipe_documents()

            # 进行文档分块
            print("进行文档分块...")
            chunks = self.data_module.chunk_documents(
                chunk_size=self.config.chunk_size,
                chunk_overlap=self.config.chunk_overlap
            )

            # 构建Milvus向量索引
            print("构建Milvus向量索引...")
            if not self.index_module.build_vector_index(chunks):
                raise Exception("构建向量索引失败")

            # 初始化检索器
            self._initialize_retrievers(chunks)

            # 显示统计信息
            stats = self._get_knowledge_base_stats()
            self._show_knowledge_base_stats(stats)

            self.knowledge_base_loaded = True
            
            result = {
                "status": "built",
                "message": "知识库构建完成",
                "stats": stats
            }
            
            print("✅ 知识库构建完成！")
            return result

        except Exception as e:
            logger.error(f"知识库构建失败: {e}")
            self.knowledge_base_loaded = False
            raise

    def unload_knowledge_base(self) -> Dict[str, Any]:
        """
        卸载知识库（从内存中移除）
        
        Returns:
            卸载结果信息
        """
        try:
            if self.index_module:
                self.index_module.close()
            
            # 重置相关模块
            self.traditional_retrieval = None
            self.graph_rag_retrieval = None
            self.query_router = None
            self.system_ready = False
            self.knowledge_base_loaded = False
            
            logger.info("知识库已卸载")
            return {"status": "success", "message": "知识库已卸载"}
            
        except Exception as e:
            logger.error(f"卸载知识库失败: {e}")
            return {"status": "error", "message": str(e)}

    def get_knowledge_base_status(self) -> Dict[str, Any]:
        """
        获取知识库状态
        
        Returns:
            状态信息
        """
        stats = self._get_knowledge_base_stats() if self.data_module else {}
        
        return {
            "knowledge_base_loaded": self.knowledge_base_loaded,
            "system_ready": self.system_ready,
            "milvus_collection_exists": self.index_module.has_collection() if self.index_module else False,
            "stats": stats
        }

    def _initialize_retrievers(self, chunks: List = None):
        """初始化检索器"""
        print("初始化检索引擎...")

        # 如果没有chunks，从数据模块获取
        if chunks is None:
            chunks = self.data_module.chunks or []

        # 初始化传统检索器
        self.traditional_retrieval = HybridRetrievalModule(
            config=self.config,
            milvus_module=self.index_module,
            data_module=self.data_module,
            llm_client=self.generation_module.client
        )
        self.traditional_retrieval.initialize(chunks)

        # 初始化图RAG检索器
        self.graph_rag_retrieval = GraphRAGRetrieval(
            config=self.config,
            llm_client=self.generation_module.client
        )
        self.graph_rag_retrieval.initialize()

        # 初始化智能查询路由器
        self.query_router = IntelligentQueryRouter(
            traditional_retrieval=self.traditional_retrieval,
            graph_rag_retrieval=self.graph_rag_retrieval,
            llm_client=self.generation_module.client,
            config=self.config
        )

        self.system_ready = True
        print("✅ 检索引擎初始化完成！")

    def _get_knowledge_base_stats(self) -> Dict[str, Any]:
        """获取知识库统计信息"""
        stats = {
            "recipes": 0,
            "ingredients": 0,
            "cooking_steps": 0,
            "documents": 0,
            "chunks": 0,
            "milvus_records": 0
        }
        
        if self.data_module:
            data_stats = self.data_module.get_statistics()
            stats.update(data_stats)
        
        if self.index_module and self.index_module.has_collection():
            milvus_stats = self.index_module.get_collection_stats()
            stats["milvus_records"] = milvus_stats.get("row_count", 0)
        
        return stats

    def _show_knowledge_base_stats(self, stats: Dict[str, Any] = None):
        """显示知识库统计信息"""
        if stats is None:
            stats = self._get_knowledge_base_stats()
            
        print(f"\n知识库统计:")
        print(f"   菜谱数量: {stats.get('recipes', 0)}")
        print(f"   食材数量: {stats.get('ingredients', 0)}")
        print(f"   烹饪步骤: {stats.get('cooking_steps', 0)}")
        print(f"   文档数量: {stats.get('documents', 0)}")
        print(f"   文本块数: {stats.get('chunks', 0)}")
        print(f"   向量索引: {stats.get('milvus_records', 0)} 条记录")
        
        if stats.get('categories'):
            categories = list(stats['categories'].keys())[:10]
            print(f"   🏷️ 主要分类: {', '.join(categories)}")

    def ask_question_with_routing(self, question: str, stream: bool = False, explain_routing: bool = False):
        """
        智能问答：自动选择最佳检索策略
        """
        if not self.system_ready or not self.knowledge_base_loaded:
            raise ValueError("系统或知识库未就绪，请先构建/加载知识库")

        print(f"\n❓ 用户问题: {question}")

        # 显示路由决策解释（可选）
        if explain_routing:
            explanation = self.query_router.explain_routing_decision(question)
            print(explanation)

        start_time = time.time()

        try:
            # 1. 智能路由检索
            print("执行智能查询路由...")
            relevant_docs, analysis = self.query_router.route_query(question, self.config.top_k)

            # 2. 显示路由信息
            strategy_icons = {
                "hybrid_traditional": "🔍",
                "graph_rag": "🕸️",
                "combined": "🔄"
            }
            strategy_icon = strategy_icons.get(analysis.recommended_strategy.value, "❓")
            print(f"{strategy_icon} 使用策略: {analysis.recommended_strategy.value}")
            print(f"📊 复杂度: {analysis.query_complexity:.2f}, 关系密集度: {analysis.relationship_intensity:.2f}")

            # 3. 显示检索结果信息
            if relevant_docs:
                doc_info = []
                for doc in relevant_docs:
                    recipe_name = doc.metadata.get('recipe_name', '未知内容')
                    search_type = doc.metadata.get('search_type', doc.metadata.get('route_strategy', 'unknown'))
                    score = doc.metadata.get('final_score', doc.metadata.get('relevance_score', 0))
                    doc_info.append(f"{recipe_name}({search_type}, {score:.3f})")

                print(f"📋 找到 {len(relevant_docs)} 个相关文档: {', '.join(doc_info[:3])}")
                if len(doc_info) > 3:
                    print(f"    等 {len(relevant_docs)} 个结果...")
            else:
                # 保持返回值签名一致：始终返回 (result, analysis)
                return "抱歉，没有找到相关的烹饪信息。请尝试其他问题。", analysis

            # 4. 生成回答
            print("🎯 智能生成回答...")

            if stream:
                try:
                    for chunk_text in self.generation_module.generate_adaptive_answer_stream(question, relevant_docs):
                        print(chunk_text, end="", flush=True)
                    print("\n")
                    result = "流式输出完成"
                except Exception as stream_error:
                    logger.error(f"流式输出过程中出现错误: {stream_error}")
                    print(f"\n⚠️ 流式输出中断，切换到标准模式...")
                    # 使用非流式作为后备
                    result = self.generation_module.generate_adaptive_answer(question, relevant_docs)
            else:
                result = self.generation_module.generate_adaptive_answer(question, relevant_docs)

            # 5. 性能统计
            end_time = time.time()
            print(f"\n⏱️ 问答完成，耗时: {end_time - start_time:.2f}秒")

            return result, analysis

        except Exception as e:
            logger.error(f"问答处理失败: {e}")
            return f"抱歉，处理问题时出现错误：{str(e)}", None

    def run_interactive(self):
        """运行交互式问答"""
        if not self.system_ready or not self.knowledge_base_loaded:
            print("❌ 系统或知识库未就绪，请先构建/加载知识库")
            return

        print("\n欢迎使用尝尝咸淡RAG烹饪助手！")
        print("可用功能：")
        print("   - 'stats' : 查看系统统计")
        print("   - 'load' : 加载/构建知识库")
        print("   - 'unload' : 卸载知识库")
        print("   - 'quit' : 退出系统")
        print("\n" + "=" * 50)

        while True:
            try:
                user_input = input("\n您的问题: ").strip()

                if not user_input:
                    continue

                if user_input.lower() == 'quit':
                    break
                elif user_input.lower() == 'stats':
                    self._show_system_stats()
                    continue
                elif user_input.lower() == 'load':
                    try:
                        result = self.load_or_build_knowledge_base()
                        print(f"✅ {result['message']}")
                    except Exception as e:
                        print(f"❌ 加载失败: {e}")
                    continue
                elif user_input.lower() == 'unload':
                    result = self.unload_knowledge_base()
                    print(f"✅ {result['message']}")
                    continue

                # 普通问答 - 使用默认设置
                use_stream = True  # 默认使用流式输出
                explain_routing = True  # 默认不显示路由决策

                print("\n回答:")

                result, analysis = self.ask_question_with_routing(
                    user_input,
                    stream=use_stream,
                    explain_routing=explain_routing
                )

                if not use_stream and result:
                    print(f"{result}\n")

            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"处理问题时出错: {e}")
                import traceback
                traceback.print_exc()

        print("\n👋 感谢使用尝尝咸淡RAG烹饪助手！")
        self._cleanup()

    def _show_system_stats(self):
        """显示系统统计信息"""
        print("\n系统运行统计")
        print("=" * 40)

        # 系统状态
        status = self.get_knowledge_base_status()
        print(f"系统就绪: {status['system_ready']}")
        print(f"知识库已加载: {status['knowledge_base_loaded']}")
        print(f"Milvus集合存在: {status['milvus_collection_exists']}")

        if status['knowledge_base_loaded']:
            # 路由统计
            route_stats = self.query_router.get_route_statistics() if self.query_router else {}
            total_queries = route_stats.get('total_queries', 0)

            if total_queries > 0:
                print(f"\n路由统计:")
                print(f"总查询次数: {total_queries}")
                print(f"传统检索: {route_stats.get('traditional_count', 0)} ({route_stats.get('traditional_ratio', 0):.1%})")
                print(f"图RAG检索: {route_stats.get('graph_rag_count', 0)} ({route_stats.get('graph_rag_ratio', 0):.1%})")
                print(f"组合策略: {route_stats.get('combined_count', 0)} ({route_stats.get('combined_ratio', 0):.1%})")
            else:
                print("\n暂无查询记录")

            # 知识库统计
            self._show_knowledge_base_stats(status.get('stats'))

    def _cleanup(self):
        """清理资源"""
        if self.data_module:
            self.data_module.close()
        if self.traditional_retrieval:
            self.traditional_retrieval.close()
        if self.graph_rag_retrieval:
            self.graph_rag_retrieval.close()
        if self.index_module:
            self.index_module.close()
