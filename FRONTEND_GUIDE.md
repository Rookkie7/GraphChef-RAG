# GraphChef RAG 前端使用指南

这是一个为 GraphChef RAG 项目创建的现代化前端界面。

## 界面预览

前端界面包含以下主要部分：

1. **顶部标题栏**：显示应用名称和知识库状态指示器
2. **左侧边栏**：知识库管理和系统状态监控
3. **主聊天区域**：智能问答对话界面
4. **底部输入区**：发送问题和配置选项

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动后端服务

在另一个终端窗口中：

```bash
cd graph_rag
python main.py
```

后端将在 http://localhost:8000 运行。

### 3. 启动前端

方式一：使用启动脚本（推荐）
```bash
# Linux/Mac
./start.sh

# Windows
start.bat
```

方式二：直接使用 npm
```bash
npm run dev
```

前端将在 http://localhost:3000 运行。

### 4. 构建知识库

1. 打开浏览器访问 http://localhost:3000
2. 在左侧边栏点击"加载/构建知识库"按钮
3. 等待构建完成（首次约需 2-5 分钟）
4. 看到"知识库就绪"提示后即可开始使用

## 功能说明

### 知识库管理

左侧边栏提供完整的知识库管理功能：

- **加载/构建知识库**：首次使用或加载已有知识库
- **强制重建**：删除旧数据并重新构建
- **卸载知识库**：从内存中卸载，但保留数据
- **删除知识库**：完全删除知识库数据（谨慎使用）

知识库状态实时显示：
- 系统就绪状态
- 知识库加载状态
- Milvus 集合存在状态
- 详细数据统计（菜谱、食材、步骤、文档、分块、向量数量）

### 智能问答

主聊天区域提供流畅的对话体验：

1. **输入问题**：在底部文本框输入您的烹饪问题
2. **配置选项**：
   - 流式输出：实时查看回答生成过程（推荐开启）
   - 显示路由分析：查看系统如何处理您的问题
3. **发送消息**：点击"发送"按钮或按 Enter 键
4. **查看回答**：支持 Markdown 格式，包含标题、列表、代码块等

快捷键：
- `Enter`：发送消息
- `Shift + Enter`：换行

### 系统状态监控

左侧边栏底部显示系统配置信息：
- LLM 模型名称
- 检索数量（Top-K）
- 系统就绪状态

可以随时重新加载系统配置。

## 设计特点

### 美观的界面

- 清新的蓝色主题（避免使用紫色）
- 优雅的渐变背景
- 精致的阴影和圆角
- 流畅的动画过渡
- 响应式布局设计

### 优秀的用户体验

- 实时状态反馈
- 智能错误提示
- 自动滚动到最新消息
- 加载状态显示
- Toast 通知提示

### 完整的功能适配

适配所有后端 API：
- 健康检查
- 知识库 CRUD 操作
- 系统状态查询
- 智能问答（流式/非流式）
- 系统重载

## 技术栈

- **React 18** + **TypeScript**：现代化的前端框架
- **Vite**：极速的开发构建工具
- **Tailwind CSS**：实用优先的样式框架
- **React Markdown**：Markdown 内容渲染
- **Lucide React**：精美的图标库
- **Axios**：HTTP 请求库
- **React Hot Toast**：通知提示组件

## 项目结构

```
frontend/
├── public/                 # 静态资源
│   └── chef-hat.svg       # Logo 图标
├── src/
│   ├── api/               # API 客户端封装
│   │   └── client.ts      # 所有 API 请求
│   ├── components/        # React 组件
│   │   ├── ChatArea.tsx          # 聊天区域
│   │   ├── ChatInput.tsx         # 输入框
│   │   ├── ChatMessage.tsx       # 消息组件
│   │   ├── Header.tsx            # 顶部标题栏
│   │   ├── KnowledgeBasePanel.tsx # 知识库管理面板
│   │   ├── Sidebar.tsx           # 左侧边栏
│   │   ├── SystemStatusPanel.tsx # 系统状态面板
│   │   └── WelcomeScreen.tsx     # 欢迎页面
│   ├── types/             # TypeScript 类型
│   │   └── index.ts       # 所有类型定义
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # 应用入口
│   └── index.css          # 全局样式
├── index.html             # HTML 入口
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind 配置
├── tsconfig.json          # TypeScript 配置
├── start.sh               # Linux/Mac 启动脚本
└── start.bat              # Windows 启动脚本
```

## 常见问题

### Q: 安装依赖失败怎么办？

A: 尝试以下解决方案：
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### Q: 前端无法连接后端？

A: 检查以下几点：
1. 后端是否在 8000 端口运行
2. 浏览器控制台是否有 CORS 错误
3. Vite 代理配置是否正确（vite.config.ts）

### Q: 构建生产版本

```bash
# 构建
npm run build

# 预览
npm run preview
```

构建产物在 `dist` 目录，可以部署到任何静态文件服务器。

### Q: 生产环境部署

需要配置反向代理（如 Nginx）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 开发建议

### 添加新功能

1. 在 `src/types/index.ts` 添加类型定义
2. 在 `src/api/client.ts` 添加 API 方法
3. 创建新的组件或修改现有组件
4. 在 `App.tsx` 中集成新功能

### 自定义样式

- 修改 `tailwind.config.js` 自定义主题色
- 在 `src/index.css` 添加全局样式
- 使用 Tailwind 的工具类快速开发

### 调试技巧

- 打开浏览器开发者工具查看网络请求
- 查看控制台日志排查错误
- 使用 React Developer Tools 调试组件状态

## 反馈与支持

如有问题或建议，欢迎提出 Issue 或 Pull Request。

祝您使用愉快！
