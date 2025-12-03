import {
  Database,
  RefreshCw,
  Trash2,
  Power,
  PlayCircle,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { KnowledgeBaseStatus } from '../types';

interface KnowledgeBasePanelProps {
  status: KnowledgeBaseStatus | null;
  isBuilding: boolean;
  isDeleting: boolean;
  onBuild: () => void;
  onRebuild: () => void;
  onUnload: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

export default function KnowledgeBasePanel({
  status,
  isBuilding,
  isDeleting,
  onBuild,
  onRebuild,
  onUnload,
  onDelete,
  onRefresh,
}: KnowledgeBasePanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary-600" />
          知识库管理
        </h2>
        <button
          onClick={onRefresh}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="刷新状态"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {status && (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">系统状态</span>
              {status.system_ready ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  就绪
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <XCircle className="w-4 h-4" />
                  未就绪
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">知识库状态</span>
              {status.knowledge_base_loaded ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  已加载
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-600 font-medium">
                  <XCircle className="w-4 h-4" />
                  未加载
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Milvus集合</span>
              {status.milvus_collection_exists ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  存在
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-600 font-medium">
                  <XCircle className="w-4 h-4" />
                  不存在
                </span>
              )}
            </div>
          </div>

          {status.stats && status.knowledge_base_loaded && (
            <div className="bg-primary-50 rounded-lg p-3 space-y-2">
              <h3 className="text-sm font-semibold text-primary-900">数据统计</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-primary-700">菜谱:</span>
                  <span className="font-semibold text-primary-900">{status.stats.recipes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">食材:</span>
                  <span className="font-semibold text-primary-900">{status.stats.ingredients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">步骤:</span>
                  <span className="font-semibold text-primary-900">{status.stats.cooking_steps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">文档:</span>
                  <span className="font-semibold text-primary-900">{status.stats.documents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">分块:</span>
                  <span className="font-semibold text-primary-900">{status.stats.chunks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">向量:</span>
                  <span className="font-semibold text-primary-900">{status.stats.milvus_records}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={onBuild}
          disabled={isBuilding || isDeleting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isBuilding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              构建中...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              加载/构建知识库
            </>
          )}
        </button>

        <button
          onClick={onRebuild}
          disabled={isBuilding || isDeleting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          强制重建
        </button>

        {status?.knowledge_base_loaded && (
          <button
            onClick={onUnload}
            disabled={isBuilding || isDeleting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Power className="w-4 h-4" />
            卸载知识库
          </button>
        )}

        <button
          onClick={onDelete}
          disabled={isBuilding || isDeleting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              删除中...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              删除知识库
            </>
          )}
        </button>
      </div>
    </div>
  );
}
