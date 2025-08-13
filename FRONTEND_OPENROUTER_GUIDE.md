# 前端 OpenRouter 配置指南

本指南说明如何在前端配置页面中设置和使用 OpenRouter 作为 AI 提供商。

## 功能概述

前端现在支持通过配置页面直接选择和配置 OpenRouter 作为 AI 提供商，无需手动编辑 `.env` 文件。

## 配置步骤

### 1. 访问配置页面

1. 启动前端应用：`cd frontend && npm start`
2. 访问 `http://localhost:3000`
3. 在主页面左侧找到 "Configuration" 部分

### 2. 选择 AI 提供商

在 "AI Provider Settings" 部分：

1. 找到 "AI Provider" 下拉菜单
2. 选择 "OpenRouter" 选项
3. 系统现在支持三个选项：
   - OpenAI
   - Anthropic  
   - **OpenRouter** (新增)

### 3. 配置 OpenRouter 设置

选择 OpenRouter 后，需要配置以下字段：

#### AI Provider Settings 部分：
- **OpenRouter API Key**: 输入您的 OpenRouter API 密钥
- **OpenRouter Base URL**: 默认为 `https://openrouter.ai/api/v1`（通常无需修改）

#### AI Behavior Settings 部分：
- **OpenRouter Model**: 选择要使用的模型，例如：
  - `openai/gpt-4o-mini` (推荐，性价比高)
  - `openai/gpt-4o`
  - `anthropic/claude-3-haiku`
  - `anthropic/claude-3-sonnet`
  - `google/gemini-pro`

### 4. 保存配置

1. 填写完所有必要字段后，点击 "Save Configuration" 按钮
2. 系统会自动保存配置到 `.env` 文件
3. 后端服务会自动重新加载配置

## 配置字段说明

### 新增的 OpenRouter 字段

| 字段名 | 描述 | 默认值 | 必填 |
|--------|------|--------|------|
| AI_PROVIDER | AI 提供商选择 | openai | 是 |
| OPENROUTER_API_KEY | OpenRouter API 密钥 | - | 当选择 OpenRouter 时必填 |
| OPENROUTER_BASE_URL | OpenRouter API 基础 URL | https://openrouter.ai/api/v1 | 否 |
| OPENROUTER_MODEL | 要使用的模型名称 | openai/gpt-4o-mini | 否 |

### 通用 AI 设置

这些设置对所有 AI 提供商都有效：

- **AI Output Language**: 输出语言（默认：Chinese）
- **AI Temperature**: 创造性程度 0.0-1.0（默认：0.5）
- **AI Max Tokens**: 最大输出令牌数（默认：250）

## 使用流程

1. **获取 API Key**: 访问 [OpenRouter](https://openrouter.ai/) 注册并获取 API Key
2. **前端配置**: 在配置页面选择 OpenRouter 并填写相关信息
3. **保存配置**: 点击保存按钮
4. **测试功能**: 使用邮件总结功能测试 OpenRouter 是否正常工作

## 优势

- **用户友好**: 无需手动编辑配置文件
- **实时生效**: 配置保存后立即生效
- **多模型支持**: 可以轻松切换不同的 AI 模型
- **统一界面**: 所有 AI 提供商配置在同一个界面

## 故障排除

### 常见问题

1. **配置保存失败**
   - 检查后端 API 服务是否正常运行
   - 确认所有必填字段都已填写

2. **OpenRouter 调用失败**
   - 验证 API Key 是否正确
   - 检查模型名称是否正确
   - 确认网络连接正常

3. **前端显示异常**
   - 刷新页面重新加载配置
   - 检查浏览器控制台是否有错误信息

### 调试步骤

1. 运行配置测试脚本：`python test_openrouter_config.py`
2. 检查后端日志输出
3. 验证 `.env` 文件是否正确更新

## 技术实现

### 前端更改

- 在 `App.js` 中添加了 OpenRouter 选项到 AI Provider 下拉菜单
- 新增了 OpenRouter API Key、Base URL 和 Model 配置字段
- 配置表单自动处理新字段的保存和加载

### 后端更改

- 更新了 `api.py` 中的 `AppConfig` 模型，包含 OpenRouter 字段
- 配置验证和保存逻辑自动支持新字段
- AI 服务已支持 OpenRouter 客户端初始化和调用

这样，用户就可以完全通过前端界面来配置和使用 OpenRouter，无需任何手动文件编辑。