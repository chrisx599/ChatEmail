import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FaEnvelope, FaCog } from 'react-icons/fa';
import './App.css';

function App() {
  // --- Email State (Lifted up to App level) ---
  const [emails, setEmails] = useState([]);
  const [emailIsLoading, setEmailIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  // --- Configuration State ---
  const [config, setConfig] = useState({
    EMAIL_ADDRESS: '', PASSWORD: '', SMTP_SERVER: '', SMTP_PORT: '', IMAP_SERVER: '', IMAP_PORT: '',
    OPENAI_API_KEY: '', MODEL_NAME: '', FETCH_LIMIT: '', FETCH_DAYS: '', FETCH_CRITERIA: ''
  });
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [configError, setConfigError] = useState('');
  const [configMessage, setConfigMessage] = useState('');

  // --- List Management State ---
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState('');

  // API helper functions
  const saveConfiguration = async (configData) => {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to save configuration');
    return data;
  };

  const createList = async (listName) => {
    const response = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: listName })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to create list');
    return data;
  };

  const getLists = async () => {
    const response = await fetch('/api/lists');
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to fetch lists');
    return data.lists || [];
  };

  const summarizeEmail = async (subject, body) => {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to summarize email');
    return data;
  };

  const categorizeEmail = async (subject, body) => {
    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to categorize email');
    return data;
  };

  const addEmailToList = async (listName, emailId) => {
    const response = await fetch(`/api/lists/${listName}/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_id: emailId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to add email to list');
    return data;
  };

  // Fetch configuration on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      setIsConfigLoading(true);
      setConfigError('');
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        if (response.ok) {
          // Ensure all config values are strings to prevent "controlled to uncontrolled" warning
          setConfig({
            EMAIL_ADDRESS: data.EMAIL_ADDRESS || '',
            PASSWORD: data.PASSWORD || '',
            SMTP_SERVER: data.SMTP_SERVER || '',
            SMTP_PORT: data.SMTP_PORT?.toString() || '',
            IMAP_SERVER: data.IMAP_SERVER || '',
            IMAP_PORT: data.IMAP_PORT?.toString() || '',
            OPENAI_API_KEY: data.OPENAI_API_KEY || '',
            MODEL_NAME: data.MODEL_NAME || '',
            FETCH_LIMIT: data.FETCH_LIMIT?.toString() || '',
            FETCH_DAYS: data.FETCH_DAYS?.toString() || '',
            FETCH_CRITERIA: data.FETCH_CRITERIA || ''
          });
        } else {
          throw new Error(data.detail || 'Failed to load configuration');
        }
      } catch (err) {
        console.error("Fetch config error:", err);
        setConfigError(err.message);
      } finally {
        setIsConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Fetch lists on component mount
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch('/api/lists');
        const data = await response.json();
        if (response.ok) {
          setLists(data.lists || []);
        } else {
          throw new Error(data.detail || 'Failed to load lists');
        }
      } catch (err) {
        console.error("Fetch lists error:", err);
        // setError(err.message); // Use main error state or a dedicated one?
      }
    };

    fetchLists();
  }, []);

  // Handlers for configuration
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : 
                       type === 'number' ? parseInt(value, 10) || 0 :
                       value;
    setConfig(prevConfig => ({ ...prevConfig, [name]: finalValue }));
  };

  const handleSaveConfig = () => {
    setIsConfigLoading(true); setConfigError(''); setConfigMessage('');
    saveConfiguration(config)
      .then(res => setConfigMessage(res.message))
      .catch(err => setConfigError(err.message))
      .finally(() => setIsConfigLoading(false));
  };

  // Handlers for list management
  const handleCreateList = () => {
    if (!newListName.trim()) return;
    setConfigError(''); // Reuse config error state for list errors for now
    createList(newListName)
      .then(() => {
        setNewListName('');
        return getLists(); // Refresh lists
      })
      .then(setLists)
      .catch(err => setConfigError(err.message)); // Reuse config error state
  };

  // Fetch emails function (defined in App to manage state persistently)
  const handleFetchEmails = async () => {
    setEmailIsLoading(true);
    setEmailError('');
    setEmailMessage('');
    try {
      const response = await fetch('/api/emails');
      const data = await response.json();
      if (response.ok) {
        setEmails(data.emails || []);
        setEmailMessage(`Successfully fetched ${data.emails?.length || 0} emails.`);
      } else {
        throw new Error(data.detail || 'Failed to fetch emails');
      }
    } catch (err) {
      console.error("Fetch emails error:", err);
      setEmailError(err.message);
      setEmails([]); // Clear emails on error
    } finally {
      setEmailIsLoading(false);
    }
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/config" element={
              <ConfigurationPage
                config={config}
                isLoading={isConfigLoading}
                message={configMessage}
                error={configError}
                handleChange={handleChange}
                handleSaveConfig={handleSaveConfig}
              />
            } />
            <Route path="/" element={
              <EmailPageWrapper 
                config={config}
                lists={lists}
                selectedList={selectedList}
                setSelectedList={setSelectedList}
                newListName={newListName}
                setNewListName={setNewListName}
                handleCreateList={handleCreateList}
                emails={emails} // Pass emails state from App
                handleFetchEmails={handleFetchEmails} // Pass fetch function from App
                emailIsLoading={emailIsLoading} // Pass loading state from App
                emailError={emailError} // Pass error state from App
                emailMessage={emailMessage} // Pass message state from App
                summarizeEmail={summarizeEmail} // Pass AI functions
                categorizeEmail={categorizeEmail}
                addEmailToList={addEmailToList}
              />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Header Component with Navigation
const Header = () => {
  return (
    <header className="App-header">
      <h1>ChatEmail AI Assistant</h1>
      <nav>
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-link">
              <FaEnvelope className="nav-icon" />
              <span>Emails</span>
            </Link>
          </li>
          <li>
            <Link to="/config" className="nav-link">
              <FaCog className="nav-icon" />
              <span>Configuration</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

// Configuration Page Component
const ConfigurationPage = ({ config, isLoading, message, error, handleChange, handleSaveConfig }) => {
  return (
    <div className="config-form">
      <h2>Email & AI Configuration</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">Error: {error}</p>}
      
      <div className="form-section">
        <h3>Email Settings</h3>
        <label>
          Email Address:
          <input type="email" name="EMAIL_ADDRESS" value={config.EMAIL_ADDRESS} onChange={handleChange} />
        </label>
        <label>
          Password:
          <input type="password" name="PASSWORD" value={config.PASSWORD} onChange={handleChange} />
        </label>
        <label>
          SMTP Server:
          <input type="text" name="SMTP_SERVER" value={config.SMTP_SERVER} onChange={handleChange} />
        </label>
        <label>
          SMTP Port:
          <input type="number" name="SMTP_PORT" value={config.SMTP_PORT} onChange={handleChange} />
        </label>
        <label>
          IMAP Server:
          <input type="text" name="IMAP_SERVER" value={config.IMAP_SERVER} onChange={handleChange} />
        </label>
        <label>
          IMAP Port:
          <input type="number" name="IMAP_PORT" value={config.IMAP_PORT} onChange={handleChange} />
        </label>
      </div>

      <div className="form-section">
        <h3>AI Settings</h3>
        <label>
          OpenAI API Key:
          <input type="password" name="OPENAI_API_KEY" value={config.OPENAI_API_KEY} onChange={handleChange} />
        </label>
        <label>
          Model Name:
          <input type="text" name="MODEL_NAME" value={config.MODEL_NAME} onChange={handleChange} />
        </label>
      </div>

      <div className="form-section">
        <h3>Email Fetching Settings</h3>
        <label>
          Fetch Limit (Number of emails to fetch):
          <input type="number" name="FETCH_LIMIT" value={config.FETCH_LIMIT} onChange={handleChange} />
        </label>
        <label>
          Fetch Days (How many days back to fetch):
          <input type="number" name="FETCH_DAYS" value={config.FETCH_DAYS} onChange={handleChange} />
        </label>
        <label>
          Fetch Criteria (e.g., 'UNSEEN', 'ALL'):
          <input type="text" name="FETCH_CRITERIA" value={config.FETCH_CRITERIA} onChange={handleChange} />
        </label>
      </div>

      <button onClick={handleSaveConfig} disabled={isLoading} className="action-btn save-btn">
        {isLoading ? 'Saving...' : 'Save Configuration'}
      </button>
    </div>
  );
};

// Wrapper for EmailPage to manage its internal state
// Receives emails and handleFetchEmails from App to maintain state persistence
const EmailPageWrapper = ({ 
  config, lists, selectedList, setSelectedList, newListName, setNewListName, handleCreateList, 
  emails, handleFetchEmails, emailIsLoading, emailError, emailMessage, // Props from App
  summarizeEmail, categorizeEmail, addEmailToList // AI functions from App
}) => {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  // Local state for EmailPageWrapper (for local UI updates, not core data)
  const [isLoading, setIsLoading] = useState(emailIsLoading); // Mirror App's state
  const [error, setError] = useState(emailError); // Mirror App's state
  const [message, setMessage] = useState(emailMessage); // Mirror App's state

  // Sync local state with props from App when they change
  useEffect(() => {
    setIsLoading(emailIsLoading);
  }, [emailIsLoading]);

  useEffect(() => {
    setError(emailError);
  }, [emailError]);

  useEffect(() => {
    setMessage(emailMessage);
  }, [emailMessage]);

  // We need to pass setEmails from App to EmailPageWrapper to allow updating emails list
  // For now, we'll assume setEmails is passed as a prop or is available in scope
  // If setEmails is not passed, we need to modify the wrapper to receive it
  // Let's assume it's passed for now.
  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    setAnalysisResult('');
    setSuggestedCategory('');
    setError(''); // This should be setEmailError if setEmails is passed
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

  const handleAddEmailToList = () => {
    if (!selectedEmail || !selectedList) return;
    setError(null);
    addEmailToList(selectedList, selectedEmail.id)
      .then(res => alert(res.message)) // Simple feedback
      .catch(err => setError(err.message));
  };

  if (selectedEmail) {
    return (
      <EmailDetail
        selectedEmail={selectedEmail}
        lists={lists}
        selectedList={selectedList}
        analysisResult={analysisResult}
        suggestedCategory={suggestedCategory}
        isAnalyzing={isAnalyzing}
        error={error}
        handleBackToList={handleBackToList}
        handleSummarize={handleSummarize}
        handleCategorize={handleCategorize}
        handleAddEmailToList={handleAddEmailToList}
        setSelectedList={setSelectedList}
      />
    );
  }

  return (
    <EmailPage 
      emails={emails}
      handleFetchEmails={handleFetchEmails}
      handleSelectEmail={handleSelectEmail}
      isLoading={isLoading} // This is now synced with emailIsLoading from App
      error={error}         // This is now synced with emailError from App
      message={message}     // This is now synced with emailMessage from App
      lists={lists}
      newListName={newListName}
      setNewListName={setNewListName}
      handleCreateList={handleCreateList}
      selectedList={selectedList}
      setSelectedList={setSelectedList}
    />
  );
};

// EmailPage Component (List and Sidebar)
const EmailPage = ({ 
  emails, handleFetchEmails, handleSelectEmail, isLoading, error, message,
  lists, newListName, setNewListName, handleCreateList, selectedList, setSelectedList
}) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [emailsPerPage, setEmailsPerPage] = useState(10); // Default 10 emails per page

  // Calculate pagination
  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = emails.slice(indexOfFirstEmail, indexOfLastEmail);
  const totalPages = Math.ceil(emails.length / emailsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Change emails per page
  const handleEmailsPerPageChange = (e) => {
    const newEmailsPerPage = parseInt(e.target.value, 10);
    setEmailsPerPage(newEmailsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <>
      <div className="sidebar">
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
          
          {/* Pagination Controls */}
          {emails.length > 0 && (
            <div className="pagination-controls">
              <label>
                Emails per page:
                <select value={emailsPerPage} onChange={handleEmailsPerPageChange}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
              
              <div className="pagination">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          <ul className="email-list">
              {currentEmails.map(email => (
                  <li key={email.id} className="email-item" onClick={() => handleSelectEmail(email)}>
                      <div className="email-subject">{email.subject}</div>
                      <div className="email-from">From: {email.from}</div>
                  </li>
              ))}
          </ul>
          
          {emails.length === 0 && !isLoading && <p>No emails to display.</p>}
          
          {/* Pagination Controls (below list as well) */}
          {emails.length > 0 && (
            <div className="pagination-controls bottom">
              <div className="pagination">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
      </div>
    </>
  );
};

// Email Detail View Component
const EmailDetail = ({ 
  selectedEmail, lists, selectedList, analysisResult, suggestedCategory, isAnalyzing, error,
  handleBackToList, handleSummarize, handleCategorize, handleAddEmailToList, setSelectedList
}) => {
  return (
    <div className="email-detail-view">
      <button onClick={handleBackToList} className="action-btn back-btn">Back to List</button>
      
      <div className="email-detail-header">
        <h2>{selectedEmail.subject}</h2>
        <p><strong>From:</strong> {selectedEmail.from}</p>
        <p><strong>Date:</strong> {selectedEmail.date}</p>
      </div>
      
      <div className="email-body">
        <pre>{selectedEmail.body}</pre>
      </div>
      
      <div className="ai-actions">
        <h3>AI Actions</h3>
        <div className="action-group">
          <button onClick={handleSummarize} disabled={isAnalyzing} className="action-btn summarize-btn">
            {isAnalyzing ? 'Summarizing...' : 'Summarize Email'}
          </button>
          {analysisResult && (
            <div className="ai-result">
              <h4>Summary:</h4>
              <p>{analysisResult}</p>
            </div>
          )}
        </div>
        
        <div className="action-group">
          <button onClick={handleCategorize} disabled={isAnalyzing} className="action-btn categorize-btn">
            {isAnalyzing ? 'Categorizing...' : 'Categorize Email'}
          </button>
          {suggestedCategory && (
            <div className="ai-result">
              <h4>Suggested Category:</h4>
              <p>{suggestedCategory}</p>
            </div>
          )}
        </div>
        
        <div className="action-group list-action">
          <select value={selectedList} onChange={e => setSelectedList(e.target.value)}>
            <option value="">Select a list</option>
            {lists.map(list => <option key={list} value={list}>{list}</option>)}
          </select>
          <button onClick={handleAddEmailToList} className="action-btn add-to-list-btn">
            Add to List
          </button>
        </div>
        {error && <p className="error-message">Error: {error}</p>}
      </div>
    </div>
  );
};

export default App;