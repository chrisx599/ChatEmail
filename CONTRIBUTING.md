# 贡献指南

感谢您对 ChatEmail 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 添加新功能

## 🚀 开始贡献

### 1. 准备开发环境

1. **Fork 项目**
   - 点击项目页面右上角的 "Fork" 按钮
   - 将项目 fork 到您的 GitHub 账户

2. **克隆项目**
   ```bash
   git clone https://github.com/your-username/ChatEmail.git
   cd ChatEmail
   ```

3. **设置上游仓库**
   ```bash
   git remote add upstream https://github.com/original-owner/ChatEmail.git
   ```

4. **安装依赖**
   ```bash
   # 后端依赖
   pip install -r requirements.txt
   
   # 前端依赖
   cd frontend
   npm install
   ```

### 2. 开发流程

1. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

2. **进行开发**
   - 遵循项目的代码规范
   - 添加必要的测试
   - 更新相关文档

3. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **创建 Pull Request**
   - 访问您的 fork 项目页面
   - 点击 "New Pull Request"
   - 填写 PR 描述和相关信息

## 📋 代码规范

### Python 代码规范

- 遵循 PEP 8 代码风格
- 使用有意义的变量和函数名
- 添加适当的注释和文档字符串
- 保持函数简洁，单一职责

```python
def analyze_email_content(subject: str, body: str) -> dict:
    """
    分析邮件内容并返回分析结果
    
    Args:
        subject: 邮件主题
        body: 邮件正文
        
    Returns:
        包含分析结果的字典
    """
    # 实现代码
    pass
```

### JavaScript/React 代码规范

- 使用 ES6+ 语法
- 组件名使用 PascalCase
- 函数名使用 camelCase
- 使用 JSX 语法编写组件
- 添加适当的 PropTypes 或 TypeScript 类型

```javascript
const EmailAnalyzer = ({ emails, onAnalyze }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      await onAnalyze(emails);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    // JSX 内容
  );
};
```

## 🧪 测试

### 运行测试

```bash
# Python 测试
python -m pytest

# React 测试
cd frontend
npm test
```

### 添加测试

- 为新功能添加单元测试
- 确保测试覆盖率不降低
- 测试用例应该清晰易懂

## 📝 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat: add email priority analysis feature
fix: resolve calendar event extraction bug
docs: update API documentation
```

## 🐛 报告 Bug

在提交 Bug 报告时，请包含以下信息：

1. **Bug 描述**: 清晰描述遇到的问题
2. **复现步骤**: 详细的复现步骤
3. **期望行为**: 描述期望的正确行为
4. **实际行为**: 描述实际发生的行为
5. **环境信息**: 
   - 操作系统
   - Python 版本
   - Node.js 版本
   - 浏览器版本（如适用）
6. **错误日志**: 相关的错误信息或日志
7. **截图**: 如果有助于理解问题

## 💡 功能建议

提出新功能建议时，请包含：

1. **功能描述**: 详细描述建议的功能
2. **使用场景**: 说明功能的使用场景和价值
3. **实现思路**: 如果有想法，可以提供实现思路
4. **相关资源**: 相关的文档、链接或参考资料

## 📚 文档贡献

文档改进包括：

- 修复错别字和语法错误
- 改进说明的清晰度
- 添加示例和用法说明
- 翻译文档到其他语言
- 添加 API 文档

## 🔍 代码审查

所有的 Pull Request 都需要经过代码审查：

- 确保代码符合项目规范
- 验证功能的正确性
- 检查是否有潜在的安全问题
- 评估性能影响
- 确保文档和测试的完整性

## 🎯 优先级

当前项目的重点关注领域：

1. **性能优化**: 提升邮件处理和 AI 分析的性能
2. **用户体验**: 改进前端界面和交互体验
3. **功能扩展**: 添加更多邮件处理和分析功能
4. **稳定性**: 修复已知 Bug 和提升系统稳定性
5. **文档完善**: 改进用户文档和开发者文档

## 📞 联系我们

如果您有任何问题或需要帮助：

- 提交 [Issue](https://github.com/your-username/ChatEmail/issues)
- 发送邮件至: your-email@example.com
- 加入我们的讨论群: [链接]

## 🙏 致谢

感谢所有为 ChatEmail 项目做出贡献的开发者！您的贡献让这个项目变得更好。

---

再次感谢您的贡献！🎉