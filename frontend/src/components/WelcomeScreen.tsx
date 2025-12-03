import { ChefHat, Sparkles, Zap, Database, AlertCircle } from 'lucide-react';

interface WelcomeScreenProps {
  kbReady: boolean;
}

export default function WelcomeScreen({ kbReady }: WelcomeScreenProps) {
  const exampleQuestions = [
    '推荐几个简单的家常菜',
    '宫保鸡丁怎么做？',
    '有什么川菜推荐？',
    '鸡肉配什么蔬菜好？',
    '适合新手的菜谱有哪些？',
    '如何制作糖醋排骨？',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <ChefHat className="w-14 h-14 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">
            欢迎使用 GraphChef RAG
          </h1>
          <p className="text-lg text-gray-600">
            基于图数据库的智能烹饪助手，让做饭变得简单
          </p>
        </div>

        {!kbReady && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-medium text-amber-900">知识库未加载</p>
              <p className="text-sm text-amber-700 mt-1">
                请在左侧面板点击"加载/构建知识库"按钮来初始化系统。
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 py-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              图数据库检索
            </h3>
            <p className="text-sm text-gray-600">
              基于 Neo4j 和 Milvus 的混合检索，深度理解菜品关系
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              智能路由
            </h3>
            <p className="text-sm text-gray-600">
              自动识别查询类型，选择最优检索策略
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              流式生成
            </h3>
            <p className="text-sm text-gray-600">
              实时查看回答生成过程，体验更流畅
            </p>
          </div>
        </div>

        {kbReady && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">试试这些问题：</p>
            <div className="grid md:grid-cols-2 gap-3">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  className="text-left px-4 py-3 bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-lg text-sm text-gray-700 hover:text-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
