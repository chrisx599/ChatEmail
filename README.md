# ChatEmail - AI 邮件助手

一个基于 AI 的智能邮件处理系统，帮助您自动分析、总结和管理邮件。支持批量处理、优先级分析、日历事件提取等功能。

## ✨ 主要功能

- 📧 **邮件自动获取**: 支持 IMAP 协议，自动获取未读邮件
- 🤖 **AI 智能分析**: 使用 GPT/Claude 等大语言模型进行邮件内容分析
- 📊 **批量摘要报告**: 生成邮件批量处理报告，按优先级排序
- 📅 **日历事件提取**: 自动识别邮件中的会议、活动等日程信息
- ⚡ **优先级分析**: 智能评估邮件重要性和紧急程度
- 💾 **数据缓存**: 使用 IndexedDB 实现前端数据持久化
- 🌐 **Web 界面**: 现代化的 React 前端界面
- 🔧 **灵活配置**: 支持多种 AI 提供商和自定义配置

## 🏗️ 技术架构

### 后端
- **Python 3.x** - 主要开发语言
- **FastAPI** - Web 框架
- **IMAP** - 邮件协议支持
- **OpenAI/Anthropic/OpenRouter** - AI 服务提供商

### 前端
- **React 19** - 前端框架
- **React Router** - 路由管理
- **IndexedDB** - 本地数据存储
- **Modern CSS** - 响应式设计

## 🚀 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/ChatEmail.git
cd ChatEmail
```

2. **后端设置**
```bash
# 安装 Python 依赖
pip install -r requirements.txt

# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env 文件，填入您的配置信息
nano .env
```

3. **前端设置**
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

### 配置说明

编辑 `.env` 文件，配置以下关键参数：

```env
# 邮件服务器配置
IMAP_SERVER=imap.gmail.com
IMAP_PORT=993
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# AI 服务配置（选择其一）
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key

# 或使用 OpenRouter
# AI_PROVIDER=openrouter
# OPENROUTER_API_KEY=your-openrouter-api-key

# 或使用 Anthropic
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 运行应用

1. **启动后端服务**
```bash
# 在项目根目录
python api.py
# 或使用 uvicorn
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

2. **启动前端服务**
```bash
# 在 frontend 目录
npm start
```

3. **访问应用**
- 前端界面: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

## 📖 使用指南

### 1. 配置设置
访问配置页面，设置邮件服务器和 AI 服务参数。

### 2. 邮件管理
- 在邮件页面查看获取的邮件列表
- 点击邮件可查看详细内容和 AI 分析结果
- 支持邮件摘要、优先级分析等功能

### 3. 批量报告
- 生成批量邮件处理报告
- 按优先级自动排序邮件
- 提取日历事件和重要信息
- 支持报告导出功能

## 🔧 高级配置

### AI 提供商配置

支持多种 AI 服务提供商：

- **OpenAI**: 官方 GPT 模型
- **OpenRouter**: 多模型聚合服务
- **Anthropic**: Claude 模型

### 邮件获取配置

```env
# 获取邮件数量限制
FETCH_LIMIT=10

# 获取最近几天的邮件（0 表示不限制）
FETCH_DAYS=7

# 邮件获取条件
FETCH_CRITERIA=UNSEEN

# 处理后是否标记为已读
MARK_AS_READ=true
```

## 📁 项目结构

```
ChatEmail/
├── api.py                 # FastAPI 后端服务
├── main.py               # 命令行版本
├── email_client.py       # 邮件客户端
├── ai_service.py         # AI 服务集成
├── config.py            # 配置管理
├── requirements.txt     # Python 依赖
├── .env.example        # 环境变量示例
└── frontend/           # React 前端
    ├── src/
    │   ├── App.js         # 主应用组件
    │   ├── components/    # 组件目录
    │   ├── services/      # 服务层
    │   └── ...
    └── package.json      # 前端依赖
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 常见问题

### Q: 如何获取 Gmail 应用密码？
A: 访问 Google 账户设置 → 安全 → 两步验证 → 应用密码，生成专用密码。

### Q: 支持哪些邮件服务商？
A: 支持所有提供 IMAP 服务的邮件提供商，如 Gmail、Outlook、QQ 邮箱等。

### Q: AI 分析结果不准确怎么办？
A: 可以调整 `AI_TEMPERATURE` 参数，或尝试不同的 AI 模型。

## 📞 支持

如果您遇到问题或有建议，请：

- 提交 [Issue](https://github.com/your-username/ChatEmail/issues)
- 发送邮件至: your-email@example.com

---

⭐ 如果这个项目对您有帮助，请给我们一个 Star！