import React, { useState, useEffect } from 'react';
import { getConfiguration, saveConfiguration, getEmails } from './api';
import './App.css';

function App() {
  const [config, setConfig] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setIsLoading(true);
    getConfiguration()
      .then(data => setConfig(data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: type === 'checkbox' ? checked : value,
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
  };

  const handleBackToList = () => {
    setSelectedEmail(null);
  };

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
                <label>IMAP Port: <input type="number" name="IMAP_PORT" value={config.IMAP_PORT || ''} onChange={handleChange} /></label>
                <label>Email Address: <input type="email" name="EMAIL_ADDRESS" value={config.EMAIL_ADDRESS || ''} onChange={handleChange} /></label>
                <label>Email Password: <input type="password" name="EMAIL_PASSWORD" value={config.EMAIL_PASSWORD || ''} onChange={handleChange} /></label>
              </div>
              {/* Add other sections similarly... */}
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