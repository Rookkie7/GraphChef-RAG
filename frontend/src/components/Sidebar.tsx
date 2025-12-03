import { useState } from 'react';
import {
  Database,
  RefreshCw,
  Trash2,
  Power,
  BarChart3,
  Settings,
  AlertCircle,
  MessageSquarePlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import type { KnowledgeBaseStatus, SystemStatus } from '../types';
import KnowledgeBasePanel from './KnowledgeBasePanel';
import SystemStatusPanel from './SystemStatusPanel';

interface SidebarProps {
  isOpen: boolean;
  kbStatus: KnowledgeBaseStatus | null;
  systemStatus: SystemStatus | null;
  onRefresh: () => void;
  onClearChat: () => void;
}

export default function Sidebar({
  isOpen,
  kbStatus,
  systemStatus,
  onRefresh,
  onClearChat,
}: SidebarProps) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBuildKB = async (forceRebuild: boolean = false) => {
    setIsBuilding(true);
    const loadingToast = toast.loading(
      forceRebuild ? '正在重新构建知识库...' : '正在加载/构建知识库...'
    );

    try {
      const response = await api.buildKnowledgeBase(forceRebuild);
      toast.success(response.message || '操作成功', { id: loadingToast });
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '操作失败', { id: loadingToast });
    } finally {
      setIsBuilding(false);
    }
  };

  const handleUnloadKB = async () => {
    const loadingToast = toast.loading('正在卸载知识库...');
    try {
      const response = await api.unloadKnowledgeBase();
      toast.success(response.message || '知识库已卸载', { id: loadingToast });
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '卸载失败', { id: loadingToast });
    }
  };

  const handleDeleteKB = async () => {
    if (!confirm('确定要删除知识库吗？此操作不可恢复！')) {
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading('正在删除知识库...');

    try {
      const response = await api.deleteKnowledgeBase();
      toast.success(response.message || '知识库已删除', { id: loadingToast });
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '删除失败', { id: loadingToast });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReloadSystem = async () => {
    const loadingToast = toast.loading('正在重新加载系统...');
    try {
      const response = await api.reloadSystem();
      toast.success(response.message || '系统已重新加载', { id: loadingToast });
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '重新加载失败', { id: loadingToast });
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={onClearChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          <MessageSquarePlus className="w-5 h-5" />
          新对话
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <KnowledgeBasePanel
          status={kbStatus}
          isBuilding={isBuilding}
          isDeleting={isDeleting}
          onBuild={() => handleBuildKB(false)}
          onRebuild={() => handleBuildKB(true)}
          onUnload={handleUnloadKB}
          onDelete={handleDeleteKB}
          onRefresh={onRefresh}
        />

        <SystemStatusPanel
          status={systemStatus}
          onReload={handleReloadSystem}
          onRefresh={onRefresh}
        />
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            首次使用请先构建知识库。构建完成后即可开始智能问答。
          </p>
        </div>
      </div>
    </aside>
  );
}
