import { Menu, ChefHat, CheckCircle, XCircle } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  kbReady: boolean;
}

export default function Header({ sidebarOpen, onToggleSidebar, kbReady }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">GraphChef RAG</h1>
            <p className="text-sm text-gray-500">智能烹饪助手</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {kbReady ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">知识库就绪</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">知识库未加载</span>
          </div>
        )}
      </div>
    </header>
  );
}
