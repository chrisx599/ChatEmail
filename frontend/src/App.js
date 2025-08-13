import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
    getConfiguration, saveConfiguration, 
    getEmails, summarizeEmail, categorizeEmail,
    getLists, createList, addEmailToList
} from './api';
import ConfigurationPage from './ConfigurationPage';
import EmailDetail from './EmailDetail';
import './App.css';

// Import icons from react-icons
import { FaEnvelope, FaCog } from 'react-icons/fa';

// Main App Component with Router
function App() {
  const [config, setConfig] = useState(null);
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
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

  // Handlers for configuration
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

  // Handlers for list management
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

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/config" element={
              <ConfigurationPage
                config={config}
                isLoading={isLoading}
                message={message}
                error={error}
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
                globalIsLoading={isLoading}
                globalError={error}
                globalMessage={message}
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

// Wrapper for EmailPage to manage its internal state
const EmailPageWrapper = ({ config, lists, selectedList, setSelectedList, newListName, setNewListName, handleCreateList, globalIsLoading, globalError, globalMessage }) => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  // Local state for EmailPageWrapper
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleFetchEmails = () => {
    if (!config || !config.EMAIL_ADDRESS || !config.EMAIL_PASSWORD) {
        alert("Please configure email account settings first.");
        navigate("/config");
        return;
    }
    
    setIsLoading(true); setError(null); setMessage(''); setEmails([]);
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
      isLoading={isLoading}
      error={error}
      message={message}
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

export default App;