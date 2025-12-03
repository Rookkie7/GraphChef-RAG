import { Settings, RefreshCw, RotateCcw, Activity } from 'lucide-react';
import type { SystemStatus } from '../types';

interface SystemStatusPanelProps {
  status: SystemStatus | null;
  onReload: () => void;
  onRefresh: () => void;
}

export default function SystemStatusPanel({
  status,
  onReload,
  onRefresh,
}: SystemStatusPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-600" />
          系统状态
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
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">LLM 模型</span>
            <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200">
              {status.config.llm_model}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">检索数量 (Top-K)</span>
            <span className="font-semibold text-gray-900">{status.config.top_k}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">系统就绪</span>
            <span
              className={`font-medium ${
                status.system_ready ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              {status.system_ready ? '是' : '否'}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={onReload}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium"
      >
        <RotateCcw className="w-4 h-4" />
        重新加载系统
      </button>
    </div>
  );
}
