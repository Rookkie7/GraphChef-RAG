import { useState } from 'react';
import { Send, Zap, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, useStream: boolean, explain: boolean) => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [useStream, setUseStream] = useState(true);
  const [explain, setExplain] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !disabled) {
      onSendMessage(input.trim(), useStream, explain);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
          <input
            type="checkbox"
            checked={useStream}
            onChange={(e) => setUseStream(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
          />
          <Zap className="w-4 h-4" />
          <span>流式输出</span>
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
          <input
            type="checkbox"
            checked={explain}
            onChange={(e) => setExplain(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
          />
          <Sparkles className="w-4 h-4" />
          <span>显示路由分析</span>
        </label>
      </div>

      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? '请先构建知识库...'
              : '输入您的烹饪问题... (Shift+Enter 换行)'
          }
          disabled={disabled || isLoading}
          rows={3}
          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500 transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className="px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center gap-2 font-medium"
        >
          <Send className="w-5 h-5" />
          发送
        </button>
      </div>

      {disabled && (
        <p className="text-sm text-amber-600">
          知识库未加载，请先在左侧面板构建知识库。
        </p>
      )}
    </form>
  );
}
