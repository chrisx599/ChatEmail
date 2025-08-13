import React, { useState, useEffect } from 'react';
import { getConfiguration, saveConfiguration, getEmails, summarizeEmail } from './api';
import './App.css';

function App() {
  const [config, setConfig] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    setIsLoading(true);
    getConfiguration()
      .then(data => setConfig(data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

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

  const handleFetchEmails = () => {
    setIsLoading(true);
    setError(null);
    setEmails([]);
    getEmails()
      .then(data => setEmails(data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    setAnalysisResult(''); // Clear previous analysis
    setError('');
  };

  const handleBackToList = () => {
    setSelectedEmail(null);
  };

  const handleSummarize = () => {
    if (!selectedEmail) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult('');
    summarizeEmail(selectedEmail.subject, selectedEmail.body)
      .then(data => setAnalysisResult(data.summary))
      .catch(err => setError(err.message))
      .finally(() => setIsAnalyzing(false));
  }

  if (selectedEmail) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Email Details</h1>
        </header>
        <main className="container">
          <div className="email-detail-view">
            <button onClick={handleBackToList} className="action-btn back-btn">Back to List</button>
            <div className="email-detail-header">
              <h2>{selectedEmail.subject}</h2>
              <p><strong>From:</strong> {selectedEmail.from}</p>
            </div>
            
            <div className="ai-actions">
              <h3>AI Analysis</h3>
              <button onClick={handleSummarize} disabled={isAnalyzing} className="action-btn summarize-btn">
                {isAnalyzing ? 'Summarizing...' : 'Summarize Email'}
              </button>
              {error && <p className="error-message">Error: {error}</p>}
              {analysisResult && (
                <div className="ai-result">
                  <h4>Summary:</h4>
                  <p>{analysisResult}</p>
                </div>
              )}
            </div>

            <div className="email-body" dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>ChatEmail AI Assistant</h1>
      </header>
      <main className="container">
        <div className="config-form">
          <h2>Configuration</h2>
          {isLoading && !config && <p>Loading configuration...</p>}
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
                <label>IMAP Mailbox: <input type="text" name="IMAP_MAILBOX" value={config.IMAP_MAILBOX || ''} onChange={handleChange} /></label>
                <label>Fetch Criteria: <input type="text" name="FETCH_CRITERIA" value={config.FETCH_CRITERIA || ''} onChange={handleChange} /></label>
                <label>Fetch Limit: <input type="number" name="FETCH_LIMIT" value={config.FETCH_LIMIT || 0} onChange={handleChange} /></label>
                <label>Fetch Days: <input type="number" name="FETCH_DAYS" value={config.FETCH_DAYS || 0} onChange={handleChange} /></label>
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
                  </select>
                </label>
                <label>OpenAI API Key: <input type="password" name="OPENAI_API_KEY" value={config.OPENAI_API_KEY || ''} onChange={handleChange} /></label>
                <label>Anthropic API Key: <input type="password" name="ANTHROPIC_API_KEY" value={config.ANTHROPIC_API_KEY || ''} onChange={handleChange} /></label>
                <label>OpenAI Base URL: <input type="text" name="OPENAI_BASE_URL" value={config.OPENAI_BASE_URL || ''} onChange={handleChange} /></label>
              </div>

              <div className="form-section">
                <h3>AI Behavior Settings</h3>
                <label>OpenAI Model: <input type="text" name="OPENAI_MODEL" value={config.OPENAI_MODEL || ''} onChange={handleChange} /></label>
                <label>AI Output Language: <input type="text" name="AI_OUTPUT_LANGUAGE" value={config.AI_OUTPUT_LANGUAGE || ''} onChange={handleChange} /></label>
                <label>AI Temperature: <input type="number" step="0.1" name="AI_TEMPERATURE" value={config.AI_TEMPERATURE || 0} onChange={handleChange} /></label>
                <label>AI Max Tokens: <input type="number" name="AI_MAX_TOKENS" value={config.AI_MAX_TOKENS || 0} onChange={handleChange} /></label>
              </div>

              <div className="form-section">
                  <h3>Application Settings</h3>
                  <label>Log Level: <input type="text" name="LOG_LEVEL" value={config.LOG_LEVEL || ''} onChange={handleChange} /></label>
              </div>

              <button onClick={handleSaveConfig} disabled={isLoading} className="action-btn save-btn">
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>
            </>
          )}
        </div>

        <div className="email-section">
            <h2>Inbox</h2>
            <button onClick={handleFetchEmails} disabled={isLoading} className="action-btn fetch-btn">
                {isLoading && emails.length === 0 ? 'Fetching...' : 'Fetch Emails'}
            </button>

            {error && <p className="error-message">Error: {error}</p>}
            {message && <p className="success-message">{message}</p>}

            <ul className="email-list">
                {emails.map(email => (
                    <li key={email.id} className="email-item" onClick={() => handleSelectEmail(email)}>
                        <div className="email-subject">{email.subject}</div>
                        <div className="email-from">From: {email.from}</div>
                    </li>
                ))}
            </ul>
            {emails.length === 0 && !isLoading && <p>No emails to display. Click "Fetch Emails" to start.</p>}
        </div>
      </main>
    </div>
  );
}

export default App;