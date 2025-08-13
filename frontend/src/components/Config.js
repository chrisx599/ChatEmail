import React, { useState, useEffect } from 'react';
import { getConfiguration, saveConfiguration } from '../api';

const Config = ({ isLoading, setIsLoading, error, setError, message, setMessage }) => {
  const [config, setConfig] = useState(null);

  // Fetch configuration when the component is loaded
  useEffect(() => {
    if (!config) {
      setIsLoading(true);
      getConfiguration()
        .then(data => setConfig(data))
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [config, setIsLoading, setError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle number conversion
    const finalValue = type === 'checkbox' ? checked : 
                       type === 'number' ? parseInt(value, 10) || 0 :
                       value;
    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: finalValue,
    }));
  };

  const handleSaveConfig = () => {
    setIsLoading(true);
    setError(null);
    setMessage('');
    saveConfiguration(config)
      .then(response => setMessage(response.message))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Configuration</h1>
      </header>
      <main className="container">
        <div className="config-form">
          <h2>Email Configuration Settings</h2>
          {isLoading && !config && <p>Loading configuration...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {message && <p className="success-message">{message}</p>}
          
          {config && (
            <>
              <div className="form-section">
                <h3>Email Account Settings</h3>
                <label>IMAP Server: <input type="text" name="IMAP_SERVER" value={config.IMAP_SERVER || ''} onChange={handleChange} /></label>
                <label>IMAP Port: <input type="number" name="IMAP_PORT" value={config.IMAP_PORT || 0} onChange={handleChange} /></label>
                <label>Email Address: <input type="email" name="EMAIL_ADDRESS" value={config.EMAIL_ADDRESS || ''} onChange={handleChange} /></label>
                <label>Email Password: <input type="password" name="EMAIL_PASSWORD" value={config.EMAIL_PASSWORD || ''} onChange={handleChange} /></label>
              </div>

              <div className="form-section">
                <h3>Email Fetching Rules</h3>
                <label>IMAP Mailbox: 
                  <select name="IMAP_MAILBOX" value={config.IMAP_MAILBOX || 'INBOX'} onChange={handleChange}>
                    <option value="INBOX">INBOX (收件箱)</option>
                    <option value="Sent">Sent (已发送)</option>
                    <option value="Drafts">Drafts (草稿箱)</option>
                    <option value="Trash">Trash (垃圾箱)</option>
                    <option value="Spam">Spam (垃圾邮件)</option>
                    <option value="Archive">Archive (归档)</option>
                    <option value="Junk">Junk (垃圾邮件)</option>
                    <option value="Outbox">Outbox (发件箱)</option>
                    <option value="Important">Important (重要)</option>
                    <option value="All Mail">All Mail (所有邮件)</option>
                  </select>
                </label>
                <label>Fetch Criteria: 
                  <select name="FETCH_CRITERIA" value={config.FETCH_CRITERIA || 'UNSEEN'} onChange={handleChange}>
                    <option value="ALL">ALL (所有邮件)</option>
                    <option value="UNSEEN">UNSEEN (未读邮件)</option>
                    <option value="SEEN">SEEN (已读邮件)</option>
                    <option value="RECENT">RECENT (最近邮件)</option>
                    <option value="FLAGGED">FLAGGED (已标记)</option>
                    <option value="UNFLAGGED">UNFLAGGED (未标记)</option>
                    <option value="ANSWERED">ANSWERED (已回复)</option>
                    <option value="UNANSWERED">UNANSWERED (未回复)</option>
                    <option value="DELETED">DELETED (已删除)</option>
                    <option value="UNDELETED">UNDELETED (未删除)</option>
                    <option value="NEW">NEW (新邮件)</option>
                    <option value="OLD">OLD (旧邮件)</option>
                  </select>
                </label>
                <label>Fetch Limit: <input type="number" name="FETCH_LIMIT" value={config.FETCH_LIMIT || 0} onChange={handleChange} /></label>
                <label>Fetch Days: <input type="number" name="FETCH_DAYS" value={config.FETCH_DAYS || 0} onChange={handleChange} /></label>
                
                {/* 添加获取规则说明 */}
                <div className="fetch-info">
                  <p className="info-text">📧 邮箱文件夹: 选择要获取邮件的文件夹</p>
                  <p className="info-text">🔍 获取条件: 设置邮件筛选条件，UNSEEN表示只获取未读邮件</p>
                  <p className="info-text">📊 获取限制: 设置单次获取的最大邮件数量，0表示无限制</p>
                  <p className="info-text">📅 获取天数: 设置获取多少天内的邮件，0表示不限制时间</p>
                </div>
              </div>

              <div className="form-section">
                  <h3>Email Actions</h3>
                  <label>Mark as Read: <input type="checkbox" name="MARK_AS_READ" checked={config.MARK_AS_READ || false} onChange={handleChange} /></label>
                  <label>Move to Folder on Success: <input type="text" name="MOVE_TO_FOLDER_ON_SUCCESS" value={config.MOVE_TO_FOLDER_ON_SUCCESS || ''} onChange={handleChange} /></label>
              </div>

              <div className="form-section">
                <h3>AI Provider Settings</h3>
                <label>AI Provider: 
                  <select name="AI_PROVIDER" value={config.AI_PROVIDER || 'openai'} onChange={handleChange}>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="openrouter">OpenRouter</option>
                  </select>
                </label>
                
                {/* 统一的API Key字段 */}
                <label>API Key: 
                  <input 
                    type="password" 
                    name={`${config.AI_PROVIDER?.toUpperCase() || 'OPENAI'}_API_KEY`}
                    value={config[`${config.AI_PROVIDER?.toUpperCase() || 'OPENAI'}_API_KEY`] || ''} 
                    onChange={handleChange}
                    placeholder={`Enter your ${config.AI_PROVIDER || 'OpenAI'} API Key`}
                  />
                </label>
                
                {/* 根据provider动态显示Base URL */}
                {(config.AI_PROVIDER === 'openai' || config.AI_PROVIDER === 'openrouter') && (
                  <label>{config.AI_PROVIDER === 'openai' ? 'OpenAI' : 'OpenRouter'} Base URL: 
                    <input 
                      type="text" 
                      name={`${config.AI_PROVIDER?.toUpperCase()}_BASE_URL`}
                      value={config[`${config.AI_PROVIDER?.toUpperCase()}_BASE_URL`] || ''} 
                      onChange={handleChange}
                      placeholder={config.AI_PROVIDER === 'openai' ? 'https://api.openai.com/v1' : 'https://openrouter.ai/api/v1'}
                    />
                  </label>
                )}
                
                {/* Provider说明 */}
                <div className="provider-info">
                  {config.AI_PROVIDER === 'openai' && (
                    <p className="info-text">💡 OpenAI: 使用官方OpenAI API，需要OpenAI账户和API密钥</p>
                  )}
                  {config.AI_PROVIDER === 'anthropic' && (
                    <p className="info-text">💡 Anthropic: 使用Claude AI，需要Anthropic账户和API密钥</p>
                  )}
                  {config.AI_PROVIDER === 'openrouter' && (
                    <p className="info-text">💡 OpenRouter: 统一的AI API网关，支持多种模型，需要OpenRouter账户和API密钥</p>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3>AI Behavior Settings</h3>
                
                {/* 根据provider动态显示模型选择 */}
                <label>AI Model: 
                  <input 
                    type="text" 
                    name={`${config.AI_PROVIDER?.toUpperCase() || 'OPENAI'}_MODEL`}
                    value={config[`${config.AI_PROVIDER?.toUpperCase() || 'OPENAI'}_MODEL`] || ''} 
                    onChange={handleChange}
                    placeholder={
                      config.AI_PROVIDER === 'openai' ? 'gpt-4o-mini' :
                      config.AI_PROVIDER === 'anthropic' ? 'claude-3-haiku-20240307' :
                      config.AI_PROVIDER === 'openrouter' ? 'openai/gpt-4o-mini' :
                      'gpt-4o-mini'
                    }
                  />
                </label>
                
                {/* 模型说明 */}
                <div className="model-info">
                  {config.AI_PROVIDER === 'openai' && (
                    <p className="info-text">🤖 推荐模型: gpt-4o-mini (性价比高), gpt-4o (功能强大)</p>
                  )}
                  {config.AI_PROVIDER === 'anthropic' && (
                    <p className="info-text">🤖 推荐模型: claude-3-haiku-20240307 (快速), claude-3-sonnet-20240229 (平衡)</p>
                  )}
                  {config.AI_PROVIDER === 'openrouter' && (
                    <p className="info-text">🤖 支持多种模型，如: openai/gpt-4o-mini, anthropic/claude-3-haiku</p>
                  )}
                </div>
                
                <label>AI Output Language: 
                  <select name="AI_OUTPUT_LANGUAGE" value={config.AI_OUTPUT_LANGUAGE || 'Chinese'} onChange={handleChange}>
                    <option value="Chinese">中文</option>
                    <option value="English">English</option>
                    <option value="Japanese">日本語</option>
                    <option value="Korean">한국어</option>
                  </select>
                </label>
                
                <label>AI Temperature (创造性): 
                  <input 
                    type="range" 
                    min="0" 
                    max="2" 
                    step="0.1" 
                    name="AI_TEMPERATURE" 
                    value={config.AI_TEMPERATURE || 0.5} 
                    onChange={handleChange}
                  />
                  <span className="range-value">{config.AI_TEMPERATURE || 0.5}</span>
                </label>
                
                <label>AI Max Tokens (最大输出长度): 
                  <input 
                    type="range" 
                    min="50" 
                    max="1000" 
                    step="50" 
                    name="AI_MAX_TOKENS" 
                    value={config.AI_MAX_TOKENS || 250} 
                    onChange={handleChange}
                  />
                  <span className="range-value">{config.AI_MAX_TOKENS || 250}</span>
                </label>
              </div>

              <div className="form-section">
                  <h3>Application Settings</h3>
                  <label>Log Level: 
                    <select name="LOG_LEVEL" value={config.LOG_LEVEL || 'INFO'} onChange={handleChange}>
                      <option value="DEBUG">DEBUG (调试级别)</option>
                      <option value="INFO">INFO (信息级别)</option>
                      <option value="WARNING">WARNING (警告级别)</option>
                      <option value="ERROR">ERROR (错误级别)</option>
                      <option value="CRITICAL">CRITICAL (严重错误)</option>
                    </select>
                  </label>
                  
                  {/* 添加日志级别说明 */}
                  <div className="log-info">
                    <p className="info-text">📝 日志级别说明:</p>
                    <p className="info-text">• DEBUG: 显示所有调试信息，用于开发调试</p>
                    <p className="info-text">• INFO: 显示一般信息，推荐日常使用</p>
                    <p className="info-text">• WARNING: 只显示警告和错误信息</p>
                    <p className="info-text">• ERROR: 只显示错误信息</p>
                    <p className="info-text">• CRITICAL: 只显示严重错误信息</p>
                  </div>
              </div>

              <button onClick={handleSaveConfig} disabled={isLoading} className="action-btn save-btn">
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Config;