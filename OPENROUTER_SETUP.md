# OpenRouter 配置指南

本项目现在支持使用 OpenRouter 作为 AI 提供商。OpenRouter 提供了对多种 AI 模型的统一访问接口。

## 配置步骤

### 1. 获取 OpenRouter API Key

1. 访问 [OpenRouter 官网](https://openrouter.ai/)
2. 注册账户并登录
3. 在账户设置中生成 API Key

### 2. 配置环境变量

在 `.env` 文件中添加以下配置：

```bash
# 设置 AI 提供商为 OpenRouter
AI_PROVIDER=openrouter

# OpenRouter API Key
OPENROUTER_API_KEY=your-openrouter-api-key-here

# OpenRouter API 基础 URL（通常不需要修改）
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# 选择要使用的模型
OPENROUTER_MODEL=openai/gpt-4o-mini
```

### 3. 可用模型

OpenRouter 支持多种模型，常用的包括：

- `openai/gpt-4o-mini` - OpenAI GPT-4o Mini
- `openai/gpt-4o` - OpenAI GPT-4o
- `openai/gpt-3.5-turbo` - OpenAI GPT-3.5 Turbo
- `anthropic/claude-3-haiku` - Anthropic Claude 3 Haiku
- `anthropic/claude-3-sonnet` - Anthropic Claude 3 Sonnet
- `google/gemini-pro` - Google Gemini Pro

更多模型请参考 [OpenRouter 模型列表](https://openrouter.ai/models)

### 4. 其他配置

其他 AI 相关配置保持不变：

```bash
AI_OUTPUT_LANGUAGE=Chinese
AI_TEMPERATURE=0.5
AI_MAX_TOKENS=250
```

## 优势

使用 OpenRouter 的优势：

1. **多模型支持**: 一个 API Key 访问多种 AI 模型
2. **成本优化**: 根据需求选择性价比最高的模型
3. **统一接口**: 兼容 OpenAI API 格式，无需修改代码
4. **高可用性**: 多个模型提供商的冗余支持

## 故障排除

如果遇到问题，请检查：

1. API Key 是否正确设置
2. 模型名称是否正确
3. 网络连接是否正常
4. OpenRouter 账户是否有足够的余额

## 切换回 OpenAI

如需切换回 OpenAI，只需修改 `.env` 文件：

```bash
AI_PROVIDER=openai
```

确保 `OPENAI_API_KEY` 已正确配置。