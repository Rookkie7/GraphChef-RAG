# GraphChef RAG Frontend

这是 GraphChef RAG 项目的前端界面，一个现代化、美观且功能完整的 Web 应用。

## 功能特性

- **智能问答聊天界面**：流畅的对话体验，支持 Markdown 格式渲染
- **知识库管理**：可视化管理知识库的构建、加载、卸载和删除
- **系统状态监控**：实时查看系统状态和知识库统计信息
- **流式输出支持**：实时查看 AI 回答的生成过程
- **智能路由分析**：可选显示查询路由和分析信息
- **响应式设计**：适配各种屏幕尺寸

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 快速的构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Axios** - HTTP 客户端
- **React Markdown** - Markdown 渲染
- **Lucide React** - 精美的图标库
- **React Hot Toast** - 优雅的通知提示

## 快速开始

### 安装依赖

```bash
cd frontend
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 http://localhost:3000 启动，并自动代理 API 请求到 http://localhost:8000

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产版本

```bash
npm run preview
```

## 使用说明

### 1. 启动后端服务

确保 GraphChef RAG 后端服务已经启动：

```bash
cd graph_rag
python main.py
```

后端服务将在 http://localhost:8000 运行。

### 2. 启动前端

```bash
cd frontend
npm run dev
```

### 3. 构建知识库

首次使用时，需要构建知识库：

1. 打开浏览器访问 http://localhost:3000
2. 在左侧边栏找到"知识库管理"部分
3. 点击"加载/构建知识库"按钮
4. 等待构建完成（首次构建可能需要几分钟）

### 4. 开始对话

知识库构建完成后，您可以：

- 在底部输入框输入烹饪相关问题
- 选择是否启用"流式输出"（推荐）
- 选择是否显示"路由分析"（用于了解系统工作原理）
- 点击"发送"或按 Enter 键提交问题

## API 适配说明

前端完整适配了以下后端 API：

### 健康检查
- `GET /api/health` - 检查服务健康状态

### 知识库管理
- `GET /api/knowledge-base/status` - 获取知识库状态
- `POST /api/knowledge-base/build` - 构建/加载知识库
- `POST /api/knowledge-base/unload` - 卸载知识库
- `DELETE /api/knowledge-base` - 删除知识库

### 问答接口
- `POST /api/ask` - 发送问题（支持流式和非流式）

### 系统管理
- `GET /api/system/status` - 获取系统状态
- `POST /api/system/reload` - 重新加载系统

## 设计特点

### 配色方案
- 主色调：蓝色系（Primary Blue）
- 辅助色：绿色、灰色、琥珀色
- 避免使用紫色、靛蓝等色调

### 用户体验
- 清晰的视觉层次
- 流畅的动画过渡
- 直观的操作反馈
- 优雅的错误提示
- 响应式布局

### 交互设计
- 实时状态更新
- 智能提示和引导
- 键盘快捷键支持（Enter 发送，Shift+Enter 换行）
- 自动滚动到最新消息

## 项目结构

```
frontend/
├── public/              # 静态资源
│   └── chef-hat.svg    # Logo 图标
├── src/
│   ├── api/            # API 客户端
│   │   └── client.ts   # API 请求封装
│   ├── components/     # React 组件
│   │   ├── ChatArea.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── Header.tsx
│   │   ├── KnowledgeBasePanel.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SystemStatusPanel.tsx
│   │   └── WelcomeScreen.tsx
│   ├── types/          # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.tsx         # 主应用组件
│   ├── main.tsx        # 应用入口
│   └── index.css       # 全局样式
├── index.html          # HTML 入口
├── package.json        # 依赖配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 配置
└── tailwind.config.js  # Tailwind CSS 配置
```

## 注意事项

1. **后端依赖**：前端需要后端服务运行在 8000 端口
2. **知识库构建**：首次使用必须先构建知识库
3. **浏览器兼容**：建议使用最新版本的 Chrome、Firefox 或 Safari
4. **开发模式**：开发模式下自动代理 API 请求，生产环境需要配置 Nginx 或其他反向代理

## 常见问题

### Q: 为什么提示"知识库未加载"？
A: 需要先在左侧边栏点击"加载/构建知识库"按钮。

### Q: 构建知识库需要多长时间？
A: 首次构建通常需要 2-5 分钟，具体取决于数据量和硬件配置。

### Q: 流式输出是什么？
A: 流式输出会实时显示 AI 回答的生成过程，提供更好的交互体验。

### Q: 如何清空对话历史？
A: 点击左侧边栏顶部的"新对话"按钮。

## 许可证

本项目遵循与 GraphChef RAG 主项目相同的许可证。
