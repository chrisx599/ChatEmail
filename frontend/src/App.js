import React, { useState } from 'react';
import './App.css';

function App() {
  const [config, setConfig] = useState({
    IMAP_SERVER: 'imap.example.com',
    IMAP_PORT: 993,
    EMAIL_ADDRESS: '',
    EMAIL_PASSWORD: '',
    IMAP_MAILBOX: 'INBOX',
    FETCH_CRITERIA: 'UNSEEN',
    FETCH_LIMIT: 10,
    FETCH_DAYS: 0,
    MARK_AS_READ: true,
    MOVE_TO_FOLDER_ON_SUCCESS: '',
    AI_PROVIDER: 'openai',
    OPENAI_API_KEY: '',
    ANTHROPIC_API_KEY: '',
    OPENAI_BASE_URL: 'https://api.openai.com/v1',
    OPENAI_MODEL: 'gpt-4o-mini',
    AI_OUTPUT_LANGUAGE: 'Chinese',
    AI_TEMPERATURE: 0.5,
    AI_MAX_TOKENS: 250,
    LOG_LEVEL: 'INFO',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDownload = () => {
    const content = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Configuration Generator</h1>
      </header>
      <main className="config-form">
        <div className="form-section">
          <h2>Email Account Settings</h2>
          <label>
            IMAP Server:
            <input type="text" name="IMAP_SERVER" value={config.IMAP_SERVER} onChange={handleChange} />
          </label>
          <label>
            IMAP Port:
            <input type="number" name="IMAP_PORT" value={config.IMAP_PORT} onChange={handleChange} />
          </label>
          <label>
            Email Address:
            <input type="email" name="EMAIL_ADDRESS" value={config.EMAIL_ADDRESS} onChange={handleChange} />
          </label>
          <label>
            Email Password:
            <input type="password" name="EMAIL_PASSWORD" value={config.EMAIL_PASSWORD} onChange={handleChange} />
          </label>
        </div>

        <div className="form-section">
          <h2>Email Fetching Rules</h2>
          <label>
            IMAP Mailbox:
            <input type="text" name="IMAP_MAILBOX" value={config.IMAP_MAILBOX} onChange={handleChange} />
          </label>
          <label>
            Fetch Criteria:
            <input type="text" name="FETCH_CRITERIA" value={config.FETCH_CRITERIA} onChange={handleChange} />
          </label>
          <label>
            Fetch Limit:
            <input type="number" name="FETCH_LIMIT" value={config.FETCH_LIMIT} onChange={handleChange} />
          </label>
          <label>
            Fetch Days:
            <input type="number" name="FETCH_DAYS" value={config.FETCH_DAYS} onChange={handleChange} />
          </label>
        </div>

        <div className="form-section">
          <h2>Email Actions</h2>
          <label>
            Mark as Read:
            <input type="checkbox" name="MARK_AS_READ" checked={config.MARK_AS_READ} onChange={handleChange} />
          </label>
          <label>
            Move to Folder on Success:
            <input type="text" name="MOVE_TO_FOLDER_ON_SUCCESS" value={config.MOVE_TO_FOLDER_ON_SUCCESS} onChange={handleChange} />
          </label>
        </div>

        <div className="form-section">
          <h2>AI Provider Settings</h2>
          <label>
            AI Provider:
            <select name="AI_PROVIDER" value={config.AI_PROVIDER} onChange={handleChange}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </label>
          <label>
            OpenAI API Key:
            <input type="password" name="OPENAI_API_KEY" value={config.OPENAI_API_KEY} onChange={handleChange} />
          </label>
          <label>
            Anthropic API Key:
            <input type="password" name="ANTHROPIC_API_KEY" value={config.ANTHROPIC_API_KEY} onChange={handleChange} />
          </label>
          <label>
            OpenAI Base URL:
            <input type="text" name="OPENAI_BASE_URL" value={config.OPENAI_BASE_URL} onChange={handleChange} />
          </label>
        </div>

        <div className="form-section">
          <h2>AI Behavior Settings</h2>
          <label>
            OpenAI Model:
            <input type="text" name="OPENAI_MODEL" value={config.OPENAI_MODEL} onChange={handleChange} />
          </label>
          <label>
            AI Output Language:
            <input type="text" name="AI_OUTPUT_LANGUAGE" value={config.AI_OUTPUT_LANGUAGE} onChange={handleChange} />
          </label>
          <label>
            AI Temperature:
            <input type="number" step="0.1" name="AI_TEMPERATURE" value={config.AI_TEMPERATURE} onChange={handleChange} />
          </label>
          <label>
            AI Max Tokens:
            <input type="number" name="AI_MAX_TOKENS" value={config.AI_MAX_TOKENS} onChange={handleChange} />
          </label>
        </div>

        <div className="form-section">
          <h2>Application Settings</h2>
          <label>
            Log Level:
            <input type="text" name="LOG_LEVEL" value={config.LOG_LEVEL} onChange={handleChange} />
          </label>
        </div>

        <button onClick={handleDownload} className="download-btn">Download .env File</button>
      </main>
    </div>
  );
}

export default App;