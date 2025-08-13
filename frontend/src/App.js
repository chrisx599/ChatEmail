import React, { useState, useEffect } from 'react';
import { 
    getConfiguration, saveConfiguration, 
    getEmails, summarizeEmail, categorizeEmail,
    getLists, createList, addEmailToList
} from './api';
import './App.css';

function App() {
  // State management
  const [config, setConfig] = useState(null);
  const [emails, setEmails] = useState([]);
  const [lists, setLists] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState('');

  // Initial data loading
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
        getConfiguration(),
        getLists()
    ]).then(([configData, listsData]) => {
        setConfig(configData);
        setLists(listsData);
        if (listsData.length > 0) {
            setSelectedList(listsData[0]);
        }
    }).catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : 
                       type === 'number' ? parseInt(value, 10) || 0 :
                       value;
    setConfig(prevConfig => ({ ...prevConfig, [name]: finalValue }));
  };

  const handleSaveConfig = () => {
    setIsLoading(true); setError(null); setMessage('');
    saveConfiguration(config)
      .then(res => setMessage(res.message))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  const handleFetchEmails = () => {
    setIsLoading(true); setError(null); setEmails([]);
    getEmails()
      .then(data => setEmails(data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    setAnalysisResult('');
    setSuggestedCategory('');
    setError('');
  };

  const handleBackToList = () => setSelectedEmail(null);

  const handleSummarize = () => {
    if (!selectedEmail) return;
    setIsAnalyzing(true); setError(null); setAnalysisResult(''); setSuggestedCategory('');
    summarizeEmail(selectedEmail.subject, selectedEmail.body)
      .then(data => setAnalysisResult(data.summary))
      .catch(err => setError(err.message))
      .finally(() => setIsAnalyzing(false));
  };

  const handleCategorize = () => {
    if (!selectedEmail) return;
    setIsAnalyzing(true); setError(null); setAnalysisResult(''); setSuggestedCategory('');
    categorizeEmail(selectedEmail.subject, selectedEmail.body)
      .then(data => setSuggestedCategory(data.category))
      .catch(err => setError(err.message))
      .finally(() => setIsAnalyzing(false));
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    setError(null);
    createList(newListName)
      .then(() => {
        setNewListName('');
        return getLists(); // Refresh lists
      })
      .then(setLists)
      .catch(err => setError(err.message));
  };

  const handleAddEmailToList = () => {
    if (!selectedEmail || !selectedList) return;
    setError(null);
    addEmailToList(selectedList, selectedEmail.id)
      .then(res => alert(res.message)) // Simple feedback
      .catch(err => setError(err.message));
  };

  // --- RENDER LOGIC ---
  if (selectedEmail) {
    // --- EMAIL DETAIL VIEW ---
    return (
      <div className="App">
        <header className="App-header"><h1>Email Details</h1></header>
        <main className="container">
          <div className="email-detail-view">
            <button onClick={handleBackToList} className="action-btn back-btn">Back to List</button>
            <div className="email-detail-header">
              <h2>{selectedEmail.subject}</h2>
              <p><strong>From:</strong> {selectedEmail.from}</p>
            </div>
            
            <div className="ai-actions">
              <h3>AI Analysis & Actions</h3>
              <div className="action-group">
                <button onClick={handleSummarize} disabled={isAnalyzing} className="action-btn summarize-btn">
                  {isAnalyzing ? 'Analyzing...' : 'Summarize'}
                </button>
                <button onClick={handleCategorize} disabled={isAnalyzing} className="action-btn categorize-btn">
                  {isAnalyzing ? 'Analyzing...' : 'Suggest Category'}
                </button>
              </div>
              {analysisResult && (
                <div className="ai-result">
                  <h4>Summary:</h4>
                  <p>{analysisResult}</p>
                </div>
              )}
              {suggestedCategory && (
                <div className="ai-result">
                  <h4>Suggested Category:</h4>
                  <p><strong>{suggestedCategory}</strong></p>
                </div>
              )}
              <div className="action-group list-action">
                <select value={selectedList} onChange={e => setSelectedList(e.target.value)}>
                  {lists.map(list => <option key={list} value={list}>{list}</option>)}
                </select>
                <button onClick={handleAddEmailToList} className="action-btn add-to-list-btn">Add to List</button>
              </div>
            </div>
            {error && <p className="error-message">Error: {error}</p>}
            <div className="email-body" dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
          </div>
        </main>
      </div>
    );
  }

  // --- MAIN VIEW ---
  return (
    <div className="App">
      <header className="App-header"><h1>ChatEmail AI Assistant</h1></header>
      <main className="container">
        <div className="sidebar">
          <div className="config-form">
            <h2>Configuration</h2>
            {config ? (
              <>
                <div className="form-section">
                    <h3>Email Account Settings</h3>
                    <label>IMAP Server: <input type="text" name="IMAP_SERVER" value={config.IMAP_SERVER || ''} onChange={handleChange} /></label>
                    <label>IMAP Port: <input type="number" name="IMAP_PORT" value={config.IMAP_PORT || 0} onChange={handleChange} /></label>
                    <label>Email Address: <input type="email" name="EMAIL_ADDRESS" value={config.EMAIL_ADDRESS || ''} onChange={handleChange} /></label>
                    <label>Email Password: <input type="password" name="EMAIL_PASSWORD" value={config.EMAIL_PASSWORD || ''} onChange={handleChange} /></label>
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
                </div>
                <button onClick={handleSaveConfig} disabled={isLoading} className="action-btn save-btn">
                    {isLoading ? 'Saving...' : 'Save Configuration'}
                </button>
              </>
            ) : <p>Loading configuration...</p>}
          </div>
          <div className="list-management">
            <h2>Custom Lists</h2>
            <ul className="custom-lists">
              {lists.map(list => <li key={list}>{list}</li>)}
            </ul>
            <div className="create-list-form">
              <input 
                type="text" 
                value={newListName} 
                onChange={e => setNewListName(e.target.value)} 
                placeholder="New list name"
              />
              <button onClick={handleCreateList}>Create List</button>
            </div>
          </div>
        </div>

        <div className="email-section">
            <h2>Inbox</h2>
            <button onClick={handleFetchEmails} disabled={isLoading} className="action-btn fetch-btn">
                {isLoading && emails.length === 0 ? 'Fetching...' : 'Fetch Emails'}
            </button>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">Error: {error}</p>}
            <ul className="email-list">
                {emails.map(email => (
                    <li key={email.id} className="email-item" onClick={() => handleSelectEmail(email)}>
                        <div className="email-subject">{email.subject}</div>
                        <div className="email-from">From: {email.from}</div>
                    </li>
                ))}
            </ul>
            {emails.length === 0 && !isLoading && <p>No emails to display.</p>}
        </div>
      </main>
    </div>
  );
}

export default App;